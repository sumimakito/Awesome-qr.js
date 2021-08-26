/* tslint:disable:no-var-requires */
import { Circle, find, Gradient } from '@svgdotjs/svg.js';
import { Canvas, CanvasGradient, CanvasPattern, CanvasRenderingContext2D, createCanvas } from 'canvas';
import { CanvasUtil } from './Common';
import { CanvasType,DataPattern, EyeBallShape, EyeFrameShape, GradientType, QRCodeFrame } from './Enums';
import { QRCodeConfig, QRDrawingConfig } from './Types';
import { cellPhoneSVGPath, isNode, isSvgFile, loadImage } from './Util';
const fetch = require("node-fetch");

export class SVGDrawing {

    private static generateDrawingConfig(config: QRCodeConfig, qrModuleCount: number): QRDrawingConfig {
        const dotScale = config.dotScale;

        if (dotScale <= 0 || dotScale > 1) {
            throw new Error('Scale should be in range (0, 1].');
        }

        const rawSize = config.size;
        let rawMargin = config.margin;

        if (rawMargin < 0 || rawMargin * 2 >= rawSize) {
            rawMargin = 0;
        }
        const margin = Math.ceil(rawMargin);

        const rawViewportSize = rawSize - 2 * rawMargin;
        const nSize = Math.ceil(rawViewportSize / qrModuleCount);
        const viewportSize = nSize * qrModuleCount;
        const size = viewportSize + 2 * margin;
        let qrmargin  = config.margin;
        if (config.frameStyle === QRCodeFrame.CIRCULAR) {
            qrmargin = 0;
        }
        const drawingConfig: Partial<QRDrawingConfig> = {
            size,
            nSize,
            rawSize: config.size,
            viewportSize,
            margin: qrmargin,
            dotScale,
            moduleSize: nSize,
        };

        // @ts-ignore
        return Object.assign(config, drawingConfig);
    }

    public config: QRDrawingConfig;
    public isPainted: boolean;
    public canvas: any;
    public context: any;

    public maskCanvas?: Canvas;
    public maskContext?: CanvasRenderingContext2D;

    private patternPosition: number[];
    private moduleCount: number;
    private isDark: any;
    // noinspection JSMismatchedCollectionQueryUpdate
    private modules: Array<Array<boolean | null>>;
    private shiftX = 0;
    private shiftY = 0;

    private canvasQR: Canvas;

    constructor(moduleCount: number, patternPosition: number[], config: QRCodeConfig, isDark: any, modules: Array<Array<boolean | null>>) {
        this.moduleCount = moduleCount;
        this.patternPosition = patternPosition;
        this.isDark = isDark;
        this.modules = modules;
        this.config = SVGDrawing.generateDrawingConfig(config, moduleCount);
        this.isPainted = false;

        this.canvasQR = createCanvas(config.size, config.size);
        const ctx = this.canvasQR.getContext('2d');

        this.setupCanvasForGradient(ctx, config.size);



        const { createSVGWindow } = require('svgdom');
        const svgWindow = createSVGWindow();
        const svgDocument = svgWindow.document;
        const { SVG, registerWindow } = require('@svgdotjs/svg.js');

        registerWindow(svgWindow, svgDocument);
        this.canvas = SVG(svgDocument.documentElement).size(config.size, config.size);
    }

    public async drawSVG(): Promise<any> {
        const frameStyle = this.config.frameStyle;

        let mainCanvas: object;
        let canvasHeight: number;
        let canvasWidth: number;

        const { createSVGWindow } = require('svgdom');
        const svgWindow = createSVGWindow();
        const svgDocument = svgWindow.document;
        const { SVG, registerWindow } = require('@svgdotjs/svg.js');


        if (frameStyle && frameStyle !== QRCodeFrame.NONE) {
            const moduleSize = this.config.moduleSize;
            const rawSize = this.config.rawSize;
            const size = rawSize + moduleSize * 2;
            canvasHeight = 1.27 * size;
            canvasWidth = size + moduleSize;
            if (frameStyle === QRCodeFrame.BANNER_TOP || frameStyle === QRCodeFrame.BANNER_BOTTOM) {
                canvasHeight = 1.25 * size;
            }
            if (frameStyle === QRCodeFrame.BOX_TOP || frameStyle === QRCodeFrame.BOX_BOTTOM) {
                canvasHeight = 1.25 * size;
            }

            mainCanvas = SVG(svgDocument.documentElement).size(canvasWidth, canvasHeight);

            // @ts-ignore
            mainCanvas.viewbox(0, 0, canvasWidth, canvasHeight).fill(this.config.backgroundColor ? this.config.backgroundColor : '#ffffff');

            switch (frameStyle) {
                case QRCodeFrame.BALLOON_BOTTOM:
                    this.shiftX = 1.5 * this.config.moduleSize;
                    this.shiftY = 1.5 * this.config.moduleSize;
                    break;
                case QRCodeFrame.BALLOON_TOP:
                    this.shiftX = 1.5 * this.config.moduleSize;
                    this.shiftY = 3.5 * this.config.moduleSize + size / 5;
                    if (this.config.isVCard) {
                        this.shiftY = 10 * moduleSize + size / 5;
                    }
                    break;
                case QRCodeFrame.BOX_BOTTOM:
                    this.shiftX = 1.5 * this.config.moduleSize;
                    this.shiftY = 1.5 * this.config.moduleSize;
                    break;
                case QRCodeFrame.BANNER_TOP:
                    this.shiftX = 1.5 * this.config.moduleSize;
                    this.shiftY = 1.5 * this.config.moduleSize + size / 5 - 1;
                    break;
                case QRCodeFrame.BANNER_BOTTOM:
                    this.shiftX = 1.5 * this.config.moduleSize;
                    this.shiftY = 1.5 * this.config.moduleSize;
                    break;
                case QRCodeFrame.BOX_TOP:
                    this.shiftX = 1.5 * this.config.moduleSize;
                    this.shiftY = 2.5 * this.config.moduleSize + size / 5;
                    break;
                default:
                    break;
            }
        } else {
            canvasHeight = this.config.size;
            canvasWidth = this.config.size;

            mainCanvas = SVG(svgDocument.documentElement).size(canvasWidth, canvasHeight);

            // @ts-ignore
            mainCanvas.viewbox(0, 0, canvasWidth, canvasHeight).fill(this.config.backgroundColor ? this.config.backgroundColor : '#ffffff');
        }

        const gradient: string = this.config.colorDark;


        return this.drawFrame(mainCanvas, this.config.frameStyle, this.config.frameColor, this.config.frameText)
            .then(() => {
                return this.addBackground(mainCanvas, this.config.size, this.config.backgroundImage, this.config.backgroundColor);
            })
            .then(() => {
                return this.drawAlignPatterns(mainCanvas, gradient);
            })
            .then(() => {
                return this.drawPositionProtectors(mainCanvas);
            })
            .then(() => {
                return this.drawAlignProtectors(mainCanvas);
            })
            .then(() => {
                return this.drawPositionPatterns(mainCanvas, gradient);
            })
            .then(() => {
                return this.fillMargin(mainCanvas);
            })
            .then(() => {
                return this.drawLogoImage(mainCanvas);
            })
            .then(()=>{
                // @ts-ignore
                return this.addDesign(mainCanvas,gradient);
            })
            .then((canvas: object) => {
                // @ts-ignore
                return canvas.svg();
            });
    }

    private checkCircle(x: number, y: number, r: number , cx: number) {
        if((x-cx)*(x-cx) + (y-cx) * (y-cx) <= r*r) {
            return true;
        }
        return false;
    }
    
    private inShape(x: number, y: number,pt: number,side: number,pty: number = 0,height :number = 0, square: boolean = true): boolean {
        let bottomX = pt ;
        let bottomY = pt  ;
        let topX = pt+side;
        let topY = pt+side;
        if(!square){
            bottomY = pty;
            topY = pty + height;
        }

        let inX = false,inY = false;
        if (x>bottomX && x<topX) {
            inX = true;
        }
        if(y> bottomY && y<topY) {
            inY = true;
        }

        return !(inX && inY);
    }
    private middleSquare(seed: number) {
        let result = (seed * seed).toString();
        const str = this.config.text;
        const len = str.length;
        if(result === 'NaN') {
            result  = (str.charCodeAt(0) + str.charCodeAt(len-1)).toString();;
        }
        while(result.length<4){
            result  = '0' + result;
        }
        result = result.slice(1, 3);
        let randomNumber = parseInt(result, 10);
        if(randomNumber ===  0){
            randomNumber = str.charCodeAt(0) + str.charCodeAt(len-1);
        }
        return randomNumber;
    }
    private async addDesignHelper(finalCanvas: object, canvas: object, gradient: string) {
        const size = this.config.size;
        const color = this.config.backgroundColor?this.config.backgroundColor:'none' ;
        const width = this.config.moduleSize;
        const pos = Math.sqrt(2)*size/2 + this.config.moduleSize;
        const radius = (size)/Math.sqrt(2) + this.config.moduleSize/2;
        // @ts-ignore
        if(this.config.backgroundImage) {
            const { createSVGWindow } = require('svgdom');
            const svgWindow = createSVGWindow();
            const svgDocument = svgWindow.document;
            const { SVG, registerWindow } = require('@svgdotjs/svg.js');
            const maskCanvas = SVG(svgDocument.documentElement).size(Math.sqrt(2)*size + 2*this.config.moduleSize, Math.sqrt(2)*size + 2*this.config.moduleSize);
            maskCanvas.circle(size).attr({cx: pos,cy: pos}).radius(radius - this.config.moduleSize/2).fill('white').attr({opacity:0.6});
            // @ts-ignore
            finalCanvas.add(maskCanvas);
        }

        const dataPattern = this.config.dataPattern ? this.config.dataPattern : DataPattern.SQUARE;
        const moduleSize = this.config.dotScale*this.config.moduleSize;
        const increment  = this.config.nSize + (1-this.config.dotScale)*0.5*this.config.nSize;
        const shift = (Math.sqrt(2)*size + 2*this.config.moduleSize-size) / 2 ;
        const limit  = Math.sqrt(2)*size + 2*this.config.moduleSize;
        const str = this.config.text;
        const len = str.length;
        let num = str.charCodeAt(0) + str.charCodeAt(len-1);
        const randomArray: any = [];
        const margin = 0.3*moduleSize;
        for(let r = shift - moduleSize - margin; r >=0 ; r -= increment) {
            for(let c = 0 ; c < limit  ; c += increment) {
                const i  = r;
                const j  = c ;
                num = this.middleSquare(num*i+j);
                if((num%2) === 0 && this.checkCircle(i,j,radius,pos) && this.checkCircle(i+moduleSize , j+moduleSize, radius, pos)) {
                  randomArray.push({"i": i,"j": j});
                }
            }
        }
        num = str.charCodeAt(0) + str.charCodeAt(len-1);
        for(let r = shift+ size + margin; r < limit ; r += increment) {
            for(let c = 0 ; c < limit  ; c += increment) {
                const i  = r;
                const j  = c ;
                num = this.middleSquare(num*i+j);
                if((num%2) === 0 && this.checkCircle(i,j,radius,pos) && this.checkCircle(i+moduleSize , j+moduleSize, radius, pos)) {
                  randomArray.push({"i": i,"j": j});
                }
            }
        }
        num = str.charCodeAt(0) + str.charCodeAt(len-1);
        for(let r = 0; r < limit ; r += increment) {
            for(let c = shift + size + margin ; c < limit  ; c += increment) {
                const i  = r;
                const j  = c ;
                num = this.middleSquare(num*i+j);
                if((num%2) === 0 && this.checkCircle(i,j,radius,pos) && this.checkCircle(i+moduleSize , j+moduleSize, radius, pos)) {
                  randomArray.push({"i": i,"j": j});
                }
            }
        }
        num = str.charCodeAt(0) + str.charCodeAt(len-1);
        for(let r = 0; r < limit ; r += increment) {
            for(let c = shift - moduleSize - margin; c >= 0  ; c -= increment) {
                const i  = r;
                const j  = c ;
                num = this.middleSquare(num*i+j);
                if((num%2 === 1) && this.checkCircle(i,j,radius,pos) && this.checkCircle(i+moduleSize , j+moduleSize, radius, pos)) {
                  randomArray.push({"i": i,"j": j});
                }
            }
        }

        for(const values of Object.values(randomArray)) {
            // @ts-ignore
            const i  = values["i"];
            // @ts-ignore
            const j  = values["j"];
            // @ts-ignore
            let grad =  await (this.getColorFromCanvas(this.canvasQR, i*size/limit,j*size/limit));
            if(this.config.gradientType === GradientType.RADIAL) {
                grad = gradient;
            }
            switch (dataPattern) {
                case DataPattern.CIRCLE:
                    // @ts-ignore
                this.drawCircle(i+moduleSize/2, j+moduleSize/2, finalCanvas, grad, moduleSize / 2, moduleSize / 2, false);
                break;
                case DataPattern.KITE:
                    // @ts-ignore
                    this.drawKite(i, j, finalCanvas, grad, moduleSize, moduleSize);
                    break;
                case DataPattern.LEFT_DIAMOND:
                    // @ts-ignore
                    this.drawDiamond(i, j, finalCanvas, grad, moduleSize, moduleSize, false);
                    break;
                case DataPattern.RIGHT_DIAMOND:
                    // @ts-ignore
                    this.drawDiamond(i, j, finalCanvas, grad, moduleSize, moduleSize, true);
                    break;
                default:
                    // @ts-ignore
                    this.drawSquare(i, j, finalCanvas, moduleSize, moduleSize, false, grad);
                    break;
            }
        }
        // @ts-ignore
        finalCanvas.add(canvas.move(shift,shift));
        return finalCanvas;
    }
    private async addDesign(canvas: object,gradient: string): Promise<object> {
        if (this.config.frameStyle !== QRCodeFrame.CIRCULAR) {
            return canvas;
        }

        const size = this.config.size;;
        const { createSVGWindow } = require('svgdom');
        const svgWindow = createSVGWindow();
        const svgDocument = svgWindow.document;
        const { SVG, registerWindow } = require('@svgdotjs/svg.js');
        const finalCanvas = SVG(svgDocument.documentElement).size(Math.sqrt(2)*size + 2*this.config.moduleSize, Math.sqrt(2)*size + 2*this.config.moduleSize);
        const color = this.config.backgroundColor?this.config.backgroundColor:'none' ;
        const width = this.config.moduleSize;

        // @ts-ignore
        let grad;
        const col1 = this.config.colorDark;
        const col2 = this.config.colorLight;
        switch (this.config.gradientType) {
            case GradientType.HORIZONTAL:
                // @ts-ignore
                grad = finalCanvas.gradient('linear', function(add) {
                    add.stop(0, col1 )
                    add.stop(1, col2 )
                    });
                    break;
            case GradientType.VERTICAL:
                // @ts-ignore
                grad = finalCanvas.gradient('linear', function(add) {
                    add.stop(0, col1 )
                    add.stop(1, col2 )
                    }).from(0, 0).to(0, 1);
                break;
            case GradientType.LINEAR:
                // @ts-ignore
                grad = finalCanvas.gradient('linear', function(add) {
                    add.stop(0, col1 )
                    add.stop(1, col2 )
                    });
                    break;
            default:
                grad =gradient;
        }
        const pos = Math.sqrt(2)*size/2 + this.config.moduleSize;
        const radius = (size)/Math.sqrt(2) + this.config.moduleSize/2;
        if (this.config.backgroundImage) {
            return this.addCircularBackgroundImage(finalCanvas, Math.sqrt(2)*size + 2*this.config.moduleSize, this.config.backgroundImage, pos, grad, width, radius).then(()=>{
                return this.addDesignHelper(finalCanvas, canvas, gradient);
            });
        }else{
            finalCanvas.circle(size).attr({cx: pos,cy: pos, stroke:grad, 'stroke-width':width}).radius(radius).fill(color);
            return this.addDesignHelper(finalCanvas, canvas, gradient);
        }

    }
    private setupCanvasForGradient(ctx: CanvasRenderingContext2D, size: number) {

        let gradient: string | CanvasGradient | CanvasPattern = this.config.colorDark ? this.config.colorDark : '#000000';

        if (this.config.gradientType) {
            switch (this.config.gradientType) {
                case GradientType.LINEAR:
                case GradientType.HORIZONTAL:
                    gradient = ctx.createLinearGradient(0, 0, this.config.moduleSize * this.moduleCount, 0);
                    gradient.addColorStop(0, this.config.colorDark);
                    gradient.addColorStop(1, this.config.colorLight);
                    break;
                case GradientType.VERTICAL:
                    gradient = ctx.createLinearGradient(0, 0, 0, this.config.moduleSize * this.moduleCount);
                    gradient.addColorStop(0, this.config.colorDark);
                    gradient.addColorStop(1, this.config.colorLight);
                    break;
                case GradientType.RADIAL:
                    gradient = ctx.createRadialGradient(
                        (this.config.moduleSize * this.moduleCount) / 2,
                        (this.config.moduleSize * this.moduleCount) / 2,
                        (this.config.moduleSize * this.moduleCount) / 6,
                        (this.config.moduleSize * this.moduleCount) / 2,
                        (this.config.moduleSize * this.moduleCount) / 2,
                        (this.config.moduleSize * this.moduleCount) / 2,
                    );
                    gradient.addColorStop(0, this.config.colorLight);
                    gradient.addColorStop(1, this.config.colorDark);
                    break;
                default:
                    break;
            }
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
    }

    private async getColorFromCanvas(canvas: Canvas, x: number, y: number) {
        const context = canvas.getContext('2d');

        const p = await context.getImageData(x, y, 1, 1).data;
        const hex = '#' + ('000000' + this.rgbToHex(p[0], p[1], p[2])).slice(-6);
        return hex;
    }

    private rgbToHex(r: number, g: number, b: number) {
        if (r > 255 || g > 255 || b > 255) {
            console.error('Invalid color component');
        }
        return ((r << 16) | (g << 8) | b).toString(16);
    }

    private async drawLogoImage(context: object) {
        if (!this.config.logoImage) {
            return;
        }

        let logoScale = this.config.logoScale;
        let logoMargin = this.config.logoMargin;
        let logoCornerRadius = this.config.logoCornerRadius;
        if (logoScale <= 0 || logoScale >= 1.0) {
            logoScale = 0.2;
        }
        if (logoMargin < 0) {
            logoMargin = 0;
        }
        if (logoCornerRadius < 0) {
            logoCornerRadius = 0;
        }

        const logoSize = this.config.viewportSize * logoScale;

        const mainMargin = this.config.margin;
        const coordinate = 0.5 * (this.config.size - logoSize);
        const centreCoordinate = coordinate - logoMargin - mainMargin;

        // ----------------------------------- Local testing ----------------------------------------

        // const fs = require('fs');
        //
        // try {
        //     const data = fs.readFileSync(__dirname + '/tests/phone-receiver.' + CanvasType.SVG.toLowerCase(), 'utf8');
        //     // console.log(data);
        //     // @ts-ignore
        //     context.svg(data.replace(/x="[a-z0-9_-]{1,15}"/, ``).replace(/y="[a-z0-9_-]{1,15}"/, ``).replace('<svg', `<svg width="${logoSize}" height="${logoSize}" x="${centreCoordinate + logoMargin / 2 + this.config.margin + this.shiftX}" y="${centreCoordinate + logoMargin / 2 + this.config.margin + this.shiftY}"`));
        //     // console.log(data);
        // } catch(e) {
        //     console.log('Error:', e.stack);
        // }

        return isSvgFile(this.config.logoImage).then((isSvg: any) => {
            if (isSvg) {
                return fetch(this.config.logoImage)
                    .then((r: { text: () => void; }) => r.text())
                    .then((text: any) => {
                        const logoWidth = logoSize * this.config.widthScale;
                        const logoHeight = logoSize * this.config.heightScale;
                        const coordinateX = 0.5 * (this.config.size - logoWidth);
                        const coordinateY =  0.5 * (this.config.size - logoHeight);
                        const centreCoordinateX = coordinateX - logoMargin - mainMargin;
                        const centreCoordinateY = coordinateY - logoMargin - mainMargin;
                        const color = this.config.backgroundColor ? this.config.backgroundColor : '#ffffff';
                        if(this.config.logoBackground !== false) {
                            // @ts-ignore
                            context.rect(logoWidth + logoMargin, logoHeight + logoMargin).fill(color).move(centreCoordinateX + this.config.margin + this.shiftX, centreCoordinateY + this.config.margin + this.shiftY).radius(logoCornerRadius);
                        }
                        text = text.substring(text.indexOf('<svg'));
                        text = text.substring(0, text.indexOf('</svg>') + 6);
                        let extraText = '';
                        const headSvg = text.substring(0, text.indexOf('>') + 1);
                        if (headSvg.indexOf(' viewBox') === -1) {
                            let width = 0, height = 0;
                            if (headSvg.indexOf(' width') !== -1) {
                                const widthIndex = headSvg.indexOf('"',headSvg.indexOf('width'));
                                width = text.substring(widthIndex + 1, headSvg.indexOf('"', widthIndex + 1));
                            }
                            if (headSvg.indexOf(' height') !== -1) {
                                const heightIndex = headSvg.indexOf('"',headSvg.indexOf('height'));
                                height = text.substring(heightIndex + 1, headSvg.indexOf('"', heightIndex + 1))
                            }
                            if (width || height) {
                                width = width ? width : height;
                                height = height ? height : width;
                            } else {
                                width = centreCoordinate + logoMargin / 2 + this.config.margin + this.shiftX + logoSize;
                                height = centreCoordinate + logoMargin / 2 + this.config.margin + this.shiftY + logoSize
                            }
                            extraText += ` viewBox="0 0 ${width - logoMargin} ${height - logoMargin}"`
                        }
                        if (headSvg.indexOf('x=') !== -1 || headSvg.indexOf('x =') !== -1) {
                            text = text.replace(/x\s*=\s*"[+.a-zA-Z0-9_-]{1,100}"/, ``);
                        }
                        if (headSvg.indexOf('y=') !== -1 || headSvg.indexOf('y =') !== -1) {
                            text = text.replace(/y\s*=\s*"[+.a-zA-Z0-9_-]{1,100}"/, ``);
                        }
                        if (headSvg.indexOf(' width') !== -1) {
                            text = text.replace(/width\s*=\s*"[+.a-zA-Z0-9_-]{1,100}"/, ``);
                        }
                        if (headSvg.indexOf(' height') !== -1) {
                            text = text.replace(/height\s*=\s*"[+.a-zA-Z0-9_-]{1,100}"/, ``);
                        }
                        try {
                            // @ts-ignore
                            context.svg(text
                                .replace('<svg', `<svg fill='#000'` + extraText + ` x="${centreCoordinateX + logoMargin / 2 + this.config.margin + this.shiftX}" y="${centreCoordinateY + logoMargin / 2 + this.config.margin + this.shiftY}" width="${logoWidth}" height="${logoHeight}"`));
                        } catch (e) {
                            console.log(e);
                            // console.log('here')
                            return this.loadNonSvgLogo(logoSize, centreCoordinate, logoMargin, logoCornerRadius, context);
                        }

                    })
                    .catch(console.error.bind(console));
                } else {
                return this.loadNonSvgLogo(logoSize, centreCoordinate, logoMargin, logoCornerRadius, context)
            }
        });
    }

    private async loadNonSvgLogo(logoSize: number, centreCoordinate: number, logoMargin: number, logoCornerRadius: number, context: any) {
        return loadImage(this.config.logoImage!, this.config.imageServerURL, this.config.imageServerRequestHeaders).then((image: any) => {

            // const cn = createCanvas(image.naturalHeight, image.naturalWidth);
            // const ct = cn.getContext('2d');
            // ct.drawImage(image, 0, 0);
            // ct.save();
            const logoWidth = logoSize * this.config.widthScale;
            const logoHeight = logoSize * this.config.heightScale;
            const cn = createCanvas(logoWidth, logoHeight);
            const ct = cn.getContext('2d');
            ct.drawImage(image, 0, 0, logoWidth, logoHeight);
            ct.save();

            const mainMargin = this.config.margin;
            const coordinateX = 0.5 * (this.config.size - logoWidth);
            const coordinateY =  0.5 * (this.config.size - logoHeight);
            const centreCoordinateX = coordinateX - logoMargin - mainMargin;
            const centreCoordinateY = coordinateY - logoMargin - mainMargin;

            // const color = this.config.backgroundColor ? this.config.backgroundColor : this.config.useOpacity ? '#ffffff' : '#ffffff99';
            //
            // if (this.config.useOpacity) {
            //     // @ts-ignore
            //     context.rect(logoSize + logoMargin, logoSize + logoMargin).fill(color).attr({opacity: 0.6}).move(centreCoordinate + this.config.margin + this.shiftX, centreCoordinate + this.config.margin + this.shiftY).radius(logoCornerRadius);
            // } else {
            //     // @ts-ignore
            //     context.rect(logoSize + logoMargin, logoSize + logoMargin).fill(color).move(centreCoordinate + this.config.margin + this.shiftX, centreCoordinate + this.config.margin + this.shiftY).radius(logoCornerRadius);
            // }
            //
            const colorNew = this.config.backgroundColor ? this.config.backgroundColor : '#ffffff';
            // @ts-ignore
            if(this.config.logoBackground !== false) {
                context.rect(logoWidth + logoMargin, logoHeight + logoMargin).fill(colorNew).move(centreCoordinateX + this.config.margin + this.shiftX, centreCoordinateY + this.config.margin + this.shiftY).radius(logoCornerRadius);
            }
            // @ts-ignore
            context.image('').size(logoWidth, logoHeight)
                .attr({ 'xlink:href': cn.toDataURL() })
                .move(centreCoordinateX + logoMargin / 2 + this.config.margin + this.shiftX, centreCoordinateY + logoMargin / 2 + this.config.margin + this.shiftY);
        });
    }

    private async addBackground(context: object, size: number, backgroundImage?: string, backgroundColor?: string) {
        if (!backgroundImage) {
            if(backgroundColor) {
                const color = backgroundColor ? backgroundColor : '#ffffff';
                    // @ts-ignore
                    context.rect(size,size).fill(color).move(this.shiftX,this.shiftY).radius(this.config.moduleSize);

            }
            return;
        }
        this.config.backgroundColor = '';
        if(this.config.frameStyle === QRCodeFrame.CIRCULAR) {
            return;
        }
        return this.addBackgroundImage(context, size, backgroundImage!);
    }

    private async addBackgroundImage(context: object, size: number, backgroundImage: string) {
        return loadImage(backgroundImage, this.config.imageServerURL, this.config.imageServerRequestHeaders).then(image => {

            // @ts-ignore
            const cn = createCanvas(this.config.size, this.config.size);
            const ct = cn.getContext('2d');
            // @ts-ignore
            ct.drawImage(image, 0, 0, image.width, image.height, 0, 0, this.config.size, this.config.size);
            ct.save();

            // @ts-ignore
            context.image('').size(this.config.size, this.config.size).move(this.shiftX, this.shiftY)
                .attr({ 'xlink:href': cn.toDataURL()});

        });
    }
    private async addCircularBackgroundImage(context: object, size: number, backgroundImage: string, pos: number, grad: string, width: number, radius: number) {
        return loadImage(backgroundImage, this.config.imageServerURL, this.config.imageServerRequestHeaders).then(image => {

            // @ts-ignore
            const cn = createCanvas(size, size);
            const ct = cn.getContext('2d');
            // @ts-ignore
            ct.drawImage(image, 0, 0, image.width, image.height, 0, 0, size, size);
            ct.save();
            // @ts-ignore
            const pattern  = context.pattern(size, size, function(add) {
                add.image('').size(size, size).attr({ 'xlink:href': cn.toDataURL()})
              });
              // @ts-ignore
            context.circle(size).attr({cx: pos,cy: pos, stroke:grad, 'stroke-width':width}).radius(radius).fill(pattern);
        });
    }
    private fillMargin(context: object) {
        const margin = this.config.margin;
        const size = this.config.size;
        const viewportSize = this.config.viewportSize;

        if (this.config.whiteMargin) {
            const color = this.config.useOpacity ? '#ffffff' : '#ffffff99';
            if (this.config.useOpacity) {
                // @ts-ignore
                context.rect(size, margin).fill(color).move(-margin + this.shiftX, -margin + this.shiftY);
                // @ts-ignore
                context.rect(size, margin).fill(color).move(-margin + this.shiftX, viewportSize + this.shiftY);
                // @ts-ignore
                context.rect(margin, size).fill(color).move(viewportSize + this.shiftX, -margin + this.shiftY);
                // @ts-ignore
                context.rect(margin, size).fill(color).move(-margin + this.shiftX, -margin + this.shiftY);
            } else {
                // @ts-ignore
                context.rect(size, margin).fill(color).move(-margin + this.shiftX, -margin + this.shiftY).attr({opacity: 0.6});
                // @ts-ignore
                context.rect(size, margin).fill(color).move(-margin + this.shiftX, viewportSize + this.shiftY).attr({opacity: 0.6});
                // @ts-ignore
                context.rect(margin, size).fill(color).move(viewportSize + this.shiftX, -margin + this.shiftY).attr({opacity: 0.6});
                // @ts-ignore
                context.rect(margin, size).fill(color).move(-margin + this.shiftX, -margin + this.shiftY).attr({opacity: 0.6});
            }
        }
    }

    private drawAlignPatterns(context: object, gradient: string) {
        const moduleCount = this.moduleCount;
        const xyOffset = (1 - this.config.dotScale) * 0.5;

        const dataPattern = this.config.dataPattern ? this.config.dataPattern : DataPattern.SQUARE;

        for (let row = 0; row < moduleCount; row++) {
            for (let col = 0; col < moduleCount; col++) {
                const bIsDark = this.isDark.bind(this)(row, col) || false;

                const isBlkPosCtr = (col < 8 && (row < 8 || row >= moduleCount - 8)) || (col >= moduleCount - 8 && row < 8);
                let bProtected = row === 6 || col === 6 || isBlkPosCtr;

                const patternPosition = this.patternPosition;
                for (let i = 0; i < patternPosition.length - 1; i++) {
                    bProtected = bProtected || (row >= patternPosition[i] - 2 && row <= patternPosition[i] + 2 && col >= patternPosition[i] - 2 && col <= patternPosition[i] + 2);
                }


                const nLeft = col * this.config.nSize + (bProtected ? 0 : xyOffset * this.config.nSize);
                const nTop = row * this.config.nSize + (bProtected ? 0 : xyOffset * this.config.nSize);

                if (this.config.logoImage) {
                    let logoScale = this.config.logoScale;
                    let logoMargin = this.config.logoMargin;
                    let logoCornerRadius = this.config.logoCornerRadius;
                    if (logoScale <= 0 || logoScale >= 1.0) {
                        logoScale = 0.2;
                    }
                    if (logoMargin < 0) {
                        logoMargin = 0;
                    }
                    if (logoCornerRadius < 0) {
                        logoCornerRadius = 0;
                    }
                    const logoWidth = this.config.widthScale * this.config.viewportSize * logoScale + 2*logoMargin;
                    const logoHeight = this.config.heightScale * this.config.viewportSize * logoScale + 2*logoMargin;
                    const moduleSize = (bProtected ? (isBlkPosCtr ? 1 : 1) : this.config.dotScale) * this.config.nSize;
                    const mainMargin = this.config.margin;
                    const coordinateX = 0.5 * (this.config.size - logoWidth);
                    const coordinateY =  0.5 * (this.config.size - logoHeight);
                    const centreCoordinateX = coordinateX - logoMargin - mainMargin;
                    const centreCoordinateY = coordinateY - logoMargin - mainMargin;
                    if(this.config.logoBackground && (!this.inShape(nLeft + moduleSize,nTop,centreCoordinateX, logoWidth, centreCoordinateY, logoHeight, false) ||
                        !this.inShape(nLeft,nTop  + moduleSize, centreCoordinateX, logoWidth, centreCoordinateY, logoHeight, false) ||
                        !this.inShape(nLeft + moduleSize,nTop  + moduleSize, centreCoordinateX, logoWidth, centreCoordinateY, logoHeight, false) ||
                        !this.inShape(nLeft - moduleSize,nTop  - moduleSize, centreCoordinateX, logoWidth, centreCoordinateY, logoHeight, false) ||
                        !this.inShape(nLeft - moduleSize,nTop, centreCoordinateX, logoWidth, centreCoordinateY, logoHeight, false) ||
                        !this.inShape(nLeft,nTop - moduleSize, centreCoordinateX, logoWidth, centreCoordinateY, logoHeight, false))) {
                        continue;
                    }
                }

                if (patternPosition.length === 0) {
                    // if align pattern list is empty, then it means that we don't need to leave room for the align patterns
                    if (!bProtected) {
                        this.fillRectWithMask(
                            context,
                            nLeft,
                            nTop,
                            (bProtected ? (isBlkPosCtr ? 1 : 1) : this.config.dotScale) * this.config.nSize,
                            (bProtected ? (isBlkPosCtr ? 1 : 1) : this.config.dotScale) * this.config.nSize,
                            bIsDark,
                            dataPattern,
                        );
                    }
                } else {
                    const inAgnRange = col < moduleCount - 4 && col >= moduleCount - 4 - 5 && row < moduleCount - 4 && row >= moduleCount - 4 - 5;
                    if (!bProtected && !inAgnRange) {
                        this.fillRectWithMask(
                            context,
                            nLeft,
                            nTop,
                            (bProtected ? (isBlkPosCtr ? 1 : 1) : this.config.dotScale) * this.config.nSize,
                            (bProtected ? (isBlkPosCtr ? 1 : 1) : this.config.dotScale) * this.config.nSize,
                            bIsDark,
                            dataPattern,
                        );
                    }
                }
            }
        }
    }

    private async fillRectWithMask(canvas: object, x: number, y: number, w: number, h: number, bIsDark: boolean, shape: DataPattern) {

        // if (!bIsDark) {
        //     return;
        // }
        const gradient = await (this.getColorFromCanvas(this.canvasQR, x, y));

        if (!this.maskCanvas) {
            const color = bIsDark ? gradient : this.config.backgroundColor ? this.config.backgroundColor : this.config.useOpacity ? '#ffffff' : '#ffffff99';

            if (!this.config.backgroundImage && !bIsDark) {
                return ;
            }

            switch (shape) {
                case DataPattern.CIRCLE:
                    this.drawCircle(x + w / 2, y + h / 2, canvas, color, h / 2, h / 2, !bIsDark);
                    break;
                case DataPattern.LEFT_DIAMOND:
                    this.drawDiamond(x, y, canvas, color, w, h, false, !bIsDark);
                    break;
                case DataPattern.RIGHT_DIAMOND:
                    this.drawDiamond(x, y, canvas, color, w, h, true, !bIsDark);
                    break;
                case DataPattern.KITE:
                    this.drawKite(x, y, canvas, color, w, h, false, !bIsDark);
                    break;
                default:
                    this.drawSquare(x, y, canvas, w, h, false, color, !bIsDark);
                    break;
            }

        } else {
            // TODO: mask canvas
            // canvas.drawImage(this.maskCanvas, x, y, w, h, x, y, w, h);
            const color = bIsDark ? gradient : this.config.backgroundColor ? this.config.backgroundColor : this.config.useOpacity ? '#ffffff' : '#ffffff99';
            this.drawSquare(x, y, canvas, w, h, false, color, !bIsDark);
        }
    }

    private drawAlignProtectors(context: object) {
        if (!this.config.backgroundImage && !this.config.backgroundColor) {
            return;
        }
        const patternPosition = this.patternPosition;
        const moduleSize = this.config.moduleSize;
        const margin = this.config.margin;
        const color = this.config.backgroundColor ? this.config.backgroundColor : this.config.useOpacity ? '#ffffff' : '#ffffff99';
        const edgeCenter = patternPosition[patternPosition.length - 1];
        for (let i = 0; i < patternPosition.length; i++) {
            for (let j = 0; j < patternPosition.length; j++) {
                const agnX = patternPosition[j];
                const agnY = patternPosition[i];
                if (agnX === 6 && (agnY === 6 || agnY === edgeCenter)) {
                } else if (agnY === 6 && (agnX === 6 || agnX === edgeCenter)) {
                } else if (agnX !== 6 && agnX !== edgeCenter && agnY !== 6 && agnY !== edgeCenter) {
                    CanvasUtil.drawSVGAlignProtector(context, agnX, agnY, moduleSize, moduleSize, margin, color, this.shiftX, this.shiftY, this.config.useOpacity);
                } else {
                    CanvasUtil.drawSVGAlignProtector(context, agnX, agnY, moduleSize, moduleSize, margin, color, this.shiftX, this.shiftY, this.config.useOpacity);
                }
            }
        }
    }

    private drawPositionProtectors(context: object) {
        const color = this.config.backgroundColor ? this.config.backgroundColor : this.config.useOpacity ? '#ffffff' : '#ffffff99';
        const size = this.config.moduleSize;
        const moduleCount = this.moduleCount;

        // h${width - moduleSize}
        // v${height - moduleSize}
        // h-${width - moduleSize}
        // v-${height - moduleSize}`)

        if (!this.config.backgroundImage) {
            return ;
        }
        let opacityD = 0.6;
        if (this.config.backgroundImage && this.config.frameStyle === QRCodeFrame.CIRCULAR) {
            opacityD = 0.0;
        }
        if (this.config.useOpacity) {
            // @ts-ignore
            context.rect(8 * size, 8 * size).fill(color).move(0 + this.config.margin + this.shiftX, 0 + this.config.margin + this.shiftY).attr({opacity: opacityD});
            // @ts-ignore
            context.rect(8 * size, 8 * size).fill(color).move(0 + this.config.margin + this.shiftX, (moduleCount - 8) * size + this.config.margin + this.shiftY).attr({opacity: opacityD});
            // @ts-ignore
            context.rect(8 * size, 8 * size).fill(color).move((moduleCount - 8) * size + this.config.margin + this.shiftX, 0 + this.config.margin + this.shiftY).attr({opacity: opacityD});
            // @ts-ignore
            context.rect((moduleCount - 8 - 8) * size, size).fill(color).move(8 * size + this.config.margin + this.shiftX, 6 * size + this.config.margin + this.shiftY).attr({opacity: opacityD});
            // @ts-ignore
            context.rect(size, (moduleCount - 8 - 8) * size).fill(color).move(6 * size + this.config.margin + this.shiftX, 8 * size + this.config.margin + this.shiftY).attr({opacity: opacityD});
        } else {
            // @ts-ignore
            context.rect(8 * size, 8 * size).fill(color).move(0 + this.config.margin + this.shiftX, 0 + this.config.margin + this.shiftY);
            // @ts-ignore
            context.rect(8 * size, 8 * size).fill(color).move(0 + this.config.margin + this.shiftX, (moduleCount - 8) * size + this.config.margin + this.shiftY);
            // @ts-ignore
            context.rect(8 * size, 8 * size).fill(color).move((moduleCount - 8) * size + this.config.margin + this.shiftX, 0 + this.config.margin + this.shiftY);
            // @ts-ignore
            context.rect((moduleCount - 8 - 8) * size, size).fill(color).move(8 * size + this.config.margin + this.shiftX, 6 * size + this.config.margin + this.shiftY);
            // @ts-ignore
            context.rect(size, (moduleCount - 8 - 8) * size).fill(color).move(6 * size + this.config.margin + this.shiftX, 8 * size + this.config.margin + this.shiftY);
        }
    }

    private async drawPositionPatterns(context: object, gradient: string) {
        const color = gradient;

        const moduleSize = this.config.moduleSize;
        const moduleCount = this.moduleCount;

        const eyeBallColor = this.config.eyeBallColor ? this.config.eyeBallColor : gradient;
        const eyeBallShape = this.config.eyeBallShape ? this.config.eyeBallShape : EyeBallShape.SQUARE;
        const eyeFrameColor = this.config.eyeFrameColor ? this.config.eyeFrameColor : gradient;
        const eyeFrameShape = this.config.eyeFrameShape ? this.config.eyeFrameShape : EyeFrameShape.SQUARE;
        const dataPattern = this.config.dataPattern ? this.config.dataPattern : DataPattern.SQUARE;

        await this.drawEyeFrames(context, eyeFrameShape, eyeFrameColor);
        await this.drawEyeBalls(context, eyeBallShape);



        for (let i = 0; i < moduleCount - 15; i += 2) {

            switch (dataPattern) {
                case DataPattern.CIRCLE:
                    const radius = moduleSize / 2;
                    gradient = await this.getColorFromCanvas(this.canvasQR, (8 + i) * moduleSize + radius, 6 * moduleSize + radius);
                    this.drawCircle((8 + i) * moduleSize + radius, 6 * moduleSize + radius, context, gradient, radius, radius, false);
                    gradient = await this.getColorFromCanvas(this.canvasQR, 6 * moduleSize + radius, (8 + i) * moduleSize + radius);
                    this.drawCircle(6 * moduleSize + radius, (8 + i) * moduleSize + radius, context, gradient, radius, radius, false);
                    break;
                case DataPattern.KITE:
                    gradient = await this.getColorFromCanvas(this.canvasQR, (8 + i) * moduleSize, 6 * moduleSize);
                    this.drawKite((8 + i) * moduleSize, 6 * moduleSize, context, gradient, moduleSize, moduleSize, false);
                    gradient = await this.getColorFromCanvas(this.canvasQR, 6 * moduleSize, (8 + i) * moduleSize);
                    this.drawKite(6 * moduleSize, (8 + i) * moduleSize, context, gradient, moduleSize, moduleSize, false);
                    break;
                case DataPattern.LEFT_DIAMOND:
                    gradient = await this.getColorFromCanvas(this.canvasQR, (8 + i) * moduleSize, 6 * moduleSize);
                    this.drawDiamond((8 + i) * moduleSize, 6 * moduleSize, context, gradient, moduleSize, moduleSize, false);
                    gradient = await this.getColorFromCanvas(this.canvasQR, 6 * moduleSize, (8 + i) * moduleSize);
                    this.drawDiamond(6 * moduleSize, (8 + i) * moduleSize, context, gradient, moduleSize, moduleSize, false);
                    break;
                case DataPattern.RIGHT_DIAMOND:
                    gradient = await this.getColorFromCanvas(this.canvasQR, (8 + i) * moduleSize, 6 * moduleSize);
                    this.drawDiamond((8 + i) * moduleSize, 6 * moduleSize, context, gradient, moduleSize, moduleSize, true);
                    gradient = await this.getColorFromCanvas(this.canvasQR, 6 * moduleSize, (8 + i) * moduleSize);
                    this.drawDiamond(6 * moduleSize, (8 + i) * moduleSize, context, gradient, moduleSize, moduleSize, true);
                    break;
                default:
                    gradient = await this.getColorFromCanvas(this.canvasQR, (8 + i) * moduleSize, 6 * moduleSize);
                    this.drawSquare((8 + i) * moduleSize, 6 * moduleSize, context, moduleSize, moduleSize, false, gradient);
                    gradient = await this.getColorFromCanvas(this.canvasQR, 6 * moduleSize, (8 + i) * moduleSize);
                    this.drawSquare(6 * moduleSize, (8 + i) * moduleSize, context, moduleSize, moduleSize, false, gradient);

            }
        }

        const patternPosition = this.patternPosition;
        const edgeCenter = patternPosition[patternPosition.length - 1];
        for (let i = 0; i < patternPosition.length; i++) {
            for (let j = 0; j < patternPosition.length; j++) {
                const agnX = patternPosition[j];
                const agnY = patternPosition[i];
                if (agnX === 6 && (agnY === 6 || agnY === edgeCenter)) {
                } else if (agnY === 6 && (agnX === 6 || agnX === edgeCenter)) {
                } else if (agnX !== 6 && agnX !== edgeCenter && agnY !== 6 && agnY !== edgeCenter) {
                    await this.drawAlign(context, agnX, agnY, moduleSize, moduleSize, dataPattern);
                } else {
                    await this.drawAlign(context, agnX, agnY, moduleSize, moduleSize, dataPattern);
                }
            }
        }
    }


    private async drawAlign(context: object, centerX: number, centerY: number, nWidth: number, nHeight: number, shape: DataPattern) {
        let drawShape;
        let boolFlag: boolean = false;
        drawShape = this.drawSquare.bind(this);

        switch (shape) {
            case DataPattern.CIRCLE:
                drawShape = this.drawCircle.bind(this);
                break;
            case DataPattern.SQUARE:
                drawShape = this.drawSquare.bind(this);
                break;
            case DataPattern.KITE:
                drawShape = this.drawKite.bind(this);
                break;
            case DataPattern.LEFT_DIAMOND:
                drawShape = this.drawDiamond.bind(this);
                break;
            case DataPattern.RIGHT_DIAMOND:
                drawShape = this.drawDiamond.bind(this);
                boolFlag = true;
                break;
            default:
                drawShape = this.drawSquare.bind(this);
                break;
        }

        let x = shape === DataPattern.CIRCLE ? (centerX - 2) * nWidth + nWidth / 2 : (centerX - 2) * nWidth;
        let y = shape === DataPattern.CIRCLE ? (centerY - 2) * nHeight + nHeight / 2 : (centerY - 2) * nHeight;
        const height = shape === DataPattern.CIRCLE ? nHeight / 2 : nHeight;
        const width = shape === DataPattern.CIRCLE ? nWidth / 2 : nWidth;
        let gr = await (this.getColorFromCanvas(this.canvasQR, x, y));

        for (let i = 0; i < 4; i++) {
            if (shape === DataPattern.SQUARE) {
                // @ts-ignore
                drawShape(x, y, context, width, height, boolFlag, gr);
            } else {
                // @ts-ignore
                drawShape(x, y, context, gr, width, height, boolFlag);
            }

            y += nHeight;
        }

        x = shape === DataPattern.CIRCLE ? (centerX + 2) * nWidth + nWidth / 2 : (centerX + 2) * nWidth;
        y = shape === DataPattern.CIRCLE ? (centerY - 2 + 1) * nHeight + nHeight / 2 : (centerY - 2 + 1) * nHeight;

        gr = await (this.getColorFromCanvas(this.canvasQR, x, y));

        for (let i = 0; i < 4; i++) {
            if (shape === DataPattern.SQUARE) {
                // @ts-ignore
                drawShape(x, y, context, width, height, boolFlag, gr);
            } else {
                // @ts-ignore
                drawShape(x, y, context, gr, width, height, boolFlag);
            }

            y += nHeight;
        }

        x = shape === DataPattern.CIRCLE ? (centerX - 2 + 1) * nWidth + nWidth / 2 : (centerX - 2 + 1) * nWidth;
        y = shape === DataPattern.CIRCLE ? (centerY - 2) * nHeight + nHeight / 2 : (centerY - 2) * nHeight;

        gr = await (this.getColorFromCanvas(this.canvasQR, x, y));

        for (let i = 0; i < 4; i++) {
            if (shape === DataPattern.SQUARE) {
                // @ts-ignore
                drawShape(x, y, context, width, height, boolFlag, gr);
            } else {
                // @ts-ignore
                drawShape(x, y, context, gr, width, height, boolFlag);
            }
            x += nWidth;
        }

        x = shape === DataPattern.CIRCLE ? (centerX - 2) * nWidth + nWidth / 2 : (centerX - 2) * nWidth;
        y = shape === DataPattern.CIRCLE ? (centerY + 2) * nHeight + nHeight / 2 : (centerY + 2) * nHeight;

        gr = await (this.getColorFromCanvas(this.canvasQR, x, y));

        for (let i = 0; i < 4; i++) {
            if (shape === DataPattern.SQUARE) {
                // @ts-ignore
                drawShape(x, y, context, width, height, boolFlag, gr);
            } else {
                // @ts-ignore
                drawShape(x, y, context, gr, width, height, boolFlag);
            }
            x += nWidth;
        }

        x = shape === DataPattern.CIRCLE ? centerX * nWidth + nWidth / 2 : centerX * nWidth;
        y = shape === DataPattern.CIRCLE ? centerY * nHeight + nHeight / 2 : centerY * nHeight;

        gr = await (this.getColorFromCanvas(this.canvasQR, x, y));

        if (shape === DataPattern.SQUARE) {
            // @ts-ignore
            drawShape(x, y, context, width, height, boolFlag, gr);
        } else {
            // @ts-ignore
            drawShape(x, y, context, gr, width, height, boolFlag);
        }
    }

    private async drawEyeFrames(context: object, shape: EyeFrameShape, color: string) {
        const moduleSize = this.config.moduleSize;
        const moduleCount = this.moduleCount;

        switch (shape) {
            case EyeFrameShape.SQUARE:
                await this.drawSquareEyeFrame(0, 0, context, 7 * moduleSize, 7 * moduleSize, false, color);
                await this.drawSquareEyeFrame((moduleCount - 7) * moduleSize, 0, context, 7 * moduleSize, 7 * moduleSize, false, color);
                await this.drawSquareEyeFrame(0, (moduleCount - 7) * moduleSize, context, 7 * moduleSize, 7 * moduleSize, false, color);
                break;
            case EyeFrameShape.ROUNDED:
                await this.drawSquareEyeFrame(0, 0, context, 7 * moduleSize, 7 * moduleSize, true, color);
                await this.drawSquareEyeFrame((moduleCount - 7) * moduleSize, 0, context, 7 * moduleSize, 7 * moduleSize, true, color);
                await this.drawSquareEyeFrame(0, (moduleCount - 7) * moduleSize, context, 7 * moduleSize, 7 * moduleSize, true, color);
                break;
            case EyeFrameShape.CIRCLE:
                await this.drawCircularFrame(0, 0, context, 7 * moduleSize, 7 * moduleSize, false, color);
                await this.drawCircularFrame((moduleCount - 7) * moduleSize, 0, context, 7 * moduleSize, 7 * moduleSize, false, color);
                await this.drawCircularFrame(0, (moduleCount - 7) * moduleSize, context, 7 * moduleSize, 7 * moduleSize, false, color);
                break;
            case EyeFrameShape.LEFT_LEAF:
                await this.drawLeafFrame(0, 0, context, 7 * moduleSize, 7 * moduleSize, false, color);
                await this.drawLeafFrame((moduleCount - 7) * moduleSize, 0, context, 7 * moduleSize, 7 * moduleSize, false, color);
                await this.drawLeafFrame(0, (moduleCount - 7) * moduleSize, context, 7 * moduleSize, 7 * moduleSize, false, color);
                break;
            case EyeFrameShape.RIGHT_LEAF:
                await this.drawLeafFrame(0, 0, context, 7 * moduleSize, 7 * moduleSize, true, color);
                await this.drawLeafFrame((moduleCount - 7) * moduleSize, 0, context, 7 * moduleSize, 7 * moduleSize, true, color);
                await this.drawLeafFrame(0, (moduleCount - 7) * moduleSize, context, 7 * moduleSize, 7 * moduleSize, true, color);
                break;
            default:
                await this.drawSquareEyeFrame(0, 0, context, 7 * moduleSize, 7 * moduleSize, false, color);
                await this.drawSquareEyeFrame((moduleCount - 7) * moduleSize, 0, context, 7 * moduleSize, 7 * moduleSize, false, color);
                await this.drawSquareEyeFrame(0, (moduleCount - 7) * moduleSize, context, 7 * moduleSize, 7 * moduleSize, false, color);
                break;
        }

    }

    private async drawEyeBalls(context: object, shape: EyeBallShape) {
        const moduleSize = this.config.moduleSize;
        const moduleCount = this.moduleCount;

        let color = this.config.eyeBallColor ? this.config.eyeBallColor : this.config.colorDark ? this.config.colorDark : '#000';

        switch (shape) {
            case EyeBallShape.CIRCLE:
                const radius1 = 3 * moduleSize / 2;
                if (!this.config.eyeBallColor && this.config.gradientType && this.config.gradientType !== GradientType.NONE) {
                    color = await this.getGradientFromCanvas(context, 2 * moduleSize, 2 * moduleSize, 2 * radius1, 2 * radius1);
                }
                this.drawCircle(2 * moduleSize + radius1, 2 * moduleSize + radius1, context, color, radius1);
                if (!this.config.eyeBallColor && this.config.gradientType && this.config.gradientType !== GradientType.NONE) {
                    color = await this.getGradientFromCanvas(context, (moduleCount - 7 + 2) * moduleSize, 2 * moduleSize, 2 * radius1, 2 * radius1);
                }
                this.drawCircle((moduleCount - 7 + 2) * moduleSize + radius1, 2 * moduleSize + radius1, context, color, radius1);
                if (!this.config.eyeBallColor && this.config.gradientType && this.config.gradientType !== GradientType.NONE) {
                    color = await this.getGradientFromCanvas(context, 2 * moduleSize, (moduleCount - 7 + 2) * moduleSize, 2 * radius1, 2 * radius1);
                }
                this.drawCircle(2 * moduleSize + radius1, (moduleCount - 7 + 2) * moduleSize + radius1, context, color, radius1);
                break;
            case EyeBallShape.ROUNDED:
                if (!this.config.eyeBallColor && this.config.gradientType && this.config.gradientType !== GradientType.NONE) {
                    color = await this.getGradientFromCanvas(context, 2 * moduleSize, 2 * moduleSize, 3 * moduleSize, 3 * moduleSize);
                }
                this.drawSquare(2 * moduleSize, 2 * moduleSize, context, 3 * moduleSize, 3 * moduleSize, true, color);
                if (!this.config.eyeBallColor && this.config.gradientType && this.config.gradientType !== GradientType.NONE) {
                    color = await this.getGradientFromCanvas(context, (moduleCount - 7 + 2) * moduleSize, 2 * moduleSize, 3 * moduleSize, 3 * moduleSize);
                }
                this.drawSquare((moduleCount - 7 + 2) * moduleSize, 2 * moduleSize, context, 3 * moduleSize, 3 * moduleSize, true, color);
                if (!this.config.eyeBallColor && this.config.gradientType && this.config.gradientType !== GradientType.NONE) {
                    color = await this.getGradientFromCanvas(context, 2 * moduleSize, (moduleCount - 7 + 2) * moduleSize, 3 * moduleSize, 3 * moduleSize);
                }
                this.drawSquare(2 * moduleSize, (moduleCount - 7 + 2) * moduleSize, context, 3 * moduleSize, 3 * moduleSize, true, color);
                break;
            case EyeBallShape.SQUARE:
                if (!this.config.eyeBallColor && this.config.gradientType && this.config.gradientType !== GradientType.NONE) {
                    color = await this.getGradientFromCanvas(context, 2 * moduleSize, 2 * moduleSize, 3 * moduleSize, 3 * moduleSize);
                }
                this.drawSquare(2 * moduleSize, 2 * moduleSize, context, 3 * moduleSize, 3 * moduleSize, false, color);
                if (!this.config.eyeBallColor && this.config.gradientType && this.config.gradientType !== GradientType.NONE) {
                    color = await this.getGradientFromCanvas(context, (moduleCount - 7 + 2) * moduleSize, 2 * moduleSize, 3 * moduleSize, 3 * moduleSize);
                }
                this.drawSquare((moduleCount - 7 + 2) * moduleSize, 2 * moduleSize, context, 3 * moduleSize, 3 * moduleSize, false, color);
                if (!this.config.eyeBallColor && this.config.gradientType && this.config.gradientType !== GradientType.NONE) {
                    color = await this.getGradientFromCanvas(context, 2 * moduleSize, (moduleCount - 7 + 2) * moduleSize, 3 * moduleSize, 3 * moduleSize);
                }
                this.drawSquare(2 * moduleSize, (moduleCount - 7 + 2) * moduleSize, context, 3 * moduleSize, 3 * moduleSize, false, color);
                break;
            case EyeBallShape.LEFT_DIAMOND:
                if (!this.config.eyeBallColor && this.config.gradientType && this.config.gradientType !== GradientType.NONE) {
                    color = await this.getGradientFromCanvas(context, 2 * moduleSize, 2 * moduleSize, 3 * moduleSize, 3 * moduleSize);
                }
                this.drawDiamond(2 * moduleSize, 2 * moduleSize, context, color, 3 * moduleSize, 3 * moduleSize, false);
                if (!this.config.eyeBallColor && this.config.gradientType && this.config.gradientType !== GradientType.NONE) {
                    color = await this.getGradientFromCanvas(context, (moduleCount - 7 + 2) * moduleSize, 2 * moduleSize, 3 * moduleSize, 3 * moduleSize);
                }
                this.drawDiamond((moduleCount - 7 + 2) * moduleSize, 2 * moduleSize, context, color, 3 * moduleSize, 3 * moduleSize, false);
                if (!this.config.eyeBallColor && this.config.gradientType && this.config.gradientType !== GradientType.NONE) {
                    color = await this.getGradientFromCanvas(context, 2 * moduleSize, (moduleCount - 7 + 2) * moduleSize, 3 * moduleSize, 3 * moduleSize);
                }
                this.drawDiamond(2 * moduleSize, (moduleCount - 7 + 2) * moduleSize, context, color, 3 * moduleSize, 3 * moduleSize, false);
                break;
            case EyeBallShape.RIGHT_DIAMOND:
                if (!this.config.eyeBallColor && this.config.gradientType && this.config.gradientType !== GradientType.NONE) {
                    color = await this.getGradientFromCanvas(context, 2 * moduleSize, 2 * moduleSize, 3 * moduleSize, 3 * moduleSize);
                }
                this.drawDiamond(2 * moduleSize, 2 * moduleSize, context, color, 3 * moduleSize, 3 * moduleSize, true);
                if (!this.config.eyeBallColor && this.config.gradientType && this.config.gradientType !== GradientType.NONE) {
                    color = await this.getGradientFromCanvas(context, (moduleCount - 7 + 2) * moduleSize, 2 * moduleSize, 3 * moduleSize, 3 * moduleSize);
                }
                this.drawDiamond((moduleCount - 7 + 2) * moduleSize, 2 * moduleSize, context, color, 3 * moduleSize, 3 * moduleSize, true);
                if (!this.config.eyeBallColor && this.config.gradientType && this.config.gradientType !== GradientType.NONE) {
                    color = await this.getGradientFromCanvas(context, 2 * moduleSize, (moduleCount - 7 + 2) * moduleSize, 3 * moduleSize, 3 * moduleSize);
                }
                this.drawDiamond(2 * moduleSize, (moduleCount - 7 + 2) * moduleSize, context, color, 3 * moduleSize, 3 * moduleSize, true);
                break;
            case EyeBallShape.LEFT_LEAF:
                const radius2 = 3 * moduleSize / 2;
                if (!this.config.eyeBallColor && this.config.gradientType && this.config.gradientType !== GradientType.NONE) {
                    color = await this.getGradientFromCanvas(context, 2 * moduleSize, 2 * moduleSize, 3 * moduleSize, 3 * moduleSize);
                }
                this.drawDiamond(2 * moduleSize, 2 * moduleSize, context, color, 3 * moduleSize, 3 * moduleSize, false);
                this.drawCircle(2 * moduleSize + radius2, 2 * moduleSize + radius2, context, color, radius2);
                if (!this.config.eyeBallColor && this.config.gradientType && this.config.gradientType !== GradientType.NONE) {
                    color = await this.getGradientFromCanvas(context, (moduleCount - 7 + 2) * moduleSize, 2 * moduleSize, 3 * moduleSize, 3 * moduleSize);
                }
                this.drawDiamond((moduleCount - 7 + 2) * moduleSize, 2 * moduleSize, context, color, 3 * moduleSize, 3 * moduleSize, false);
                this.drawCircle((moduleCount - 7 + 2) * moduleSize + radius2, 2 * moduleSize + radius2, context, color, radius2);
                if (!this.config.eyeBallColor && this.config.gradientType && this.config.gradientType !== GradientType.NONE) {
                    color = await this.getGradientFromCanvas(context, 2 * moduleSize, (moduleCount - 7 + 2) * moduleSize, 3 * moduleSize, 3 * moduleSize);
                }
                this.drawDiamond(2 * moduleSize, (moduleCount - 7 + 2) * moduleSize, context, color, 3 * moduleSize, 3 * moduleSize, false);
                this.drawCircle(2 * moduleSize + radius2, (moduleCount - 7 + 2) * moduleSize + radius2, context, color, radius2);
                break;
            case EyeBallShape.RIGHT_LEAF:
                const radius3 = 3 * moduleSize / 2;
                if (!this.config.eyeBallColor && this.config.gradientType && this.config.gradientType !== GradientType.NONE) {
                    color = await this.getGradientFromCanvas(context, 2 * moduleSize, 2 * moduleSize, 3 * moduleSize, 3 * moduleSize);
                }
                this.drawDiamond(2 * moduleSize, 2 * moduleSize, context, color, 3 * moduleSize, 3 * moduleSize, true);
                this.drawCircle(2 * moduleSize + radius3, 2 * moduleSize + radius3, context, color, radius3);
                if (!this.config.eyeBallColor && this.config.gradientType && this.config.gradientType !== GradientType.NONE) {
                    color = await this.getGradientFromCanvas(context, (moduleCount - 7 + 2) * moduleSize, 2 * moduleSize, 3 * moduleSize, 3 * moduleSize);
                }
                this.drawDiamond((moduleCount - 7 + 2) * moduleSize, 2 * moduleSize, context, color, 3 * moduleSize, 3 * moduleSize, true);
                this.drawCircle((moduleCount - 7 + 2) * moduleSize + radius3, 2 * moduleSize + radius3, context, color, radius3);
                if (!this.config.eyeBallColor && this.config.gradientType && this.config.gradientType !== GradientType.NONE) {
                    color = await this.getGradientFromCanvas(context, 2 * moduleSize, (moduleCount - 7 + 2) * moduleSize, 3 * moduleSize, 3 * moduleSize);
                }
                this.drawDiamond(2 * moduleSize, (moduleCount - 7 + 2) * moduleSize, context, color, 3 * moduleSize, 3 * moduleSize, true);
                this.drawCircle(2 * moduleSize + radius3, (moduleCount - 7 + 2) * moduleSize + radius3, context, color, radius3);
                break;
            default:
                if (!this.config.eyeBallColor && this.config.gradientType && this.config.gradientType !== GradientType.NONE) {
                    color = await this.getGradientFromCanvas(context, 2 * moduleSize, 2 * moduleSize, 3 * moduleSize, 3 * moduleSize);
                }
                this.drawSquare(2 * moduleSize, 2 * moduleSize, context, 3 * moduleSize, 3 * moduleSize, false, color);
                if (!this.config.eyeBallColor && this.config.gradientType && this.config.gradientType !== GradientType.NONE) {
                    color = await this.getGradientFromCanvas(context, (moduleCount - 7 + 2) * moduleSize, 2 * moduleSize, 3 * moduleSize, 3 * moduleSize);
                }
                this.drawSquare((moduleCount - 7 + 2) * moduleSize, 2 * moduleSize, context, 3 * moduleSize, 3 * moduleSize, false, color);
                if (!this.config.eyeBallColor && this.config.gradientType && this.config.gradientType !== GradientType.NONE) {
                    color = await this.getGradientFromCanvas(context, 2 * moduleSize, (moduleCount - 7 + 2) * moduleSize, 3 * moduleSize, 3 * moduleSize);
                }
                this.drawSquare(2 * moduleSize, (moduleCount - 7 + 2) * moduleSize, context, 3 * moduleSize, 3 * moduleSize, false, color);
                break;
        }

    }

    private drawSquare(startX: number, startY: number, canvas: object, width: number, height: number, isRound: boolean, gradient: string, isMask?: boolean) {
        let op = isMask ? 0.6 : 1;
        if(this.config.frameStyle === QRCodeFrame.CIRCULAR && this.config.backgroundImage && isMask) {
            op = 0.0;
        }
        if (isRound) {
            if (this.config.useOpacity) {
                // @ts-ignore
                // canvas.path(`M0 0
                //     h${width - height / 4 * 2.5}
                //     a${height / 4},${height / 4} 0 0 1 ${height / 4},${height / 4}
                //     v${height - height / 4 * 2.5}
                //     a${height / 4},${height / 4} 0 0 1 -${height / 4},${height / 4}
                //     h-${width - height / 4 * 2.5}
                //     a${height / 4},${height / 4} 0 0 1 -${height / 4},-${height / 4}
                //     v-${height - height / 4 * 2.5}
                //     a${height / 4},${height / 4} 0 0 1 ${height / 4},-${height / 4}`)
                canvas.rect(height, width).radius(height / 4)
                    .fill(gradient).move(startX + this.config.margin + this.shiftX, startY + this.config.margin + this.shiftY).attr({opacity: op});
            } else {
                // @ts-ignore
                // canvas.path(`M0 0
                //     h${width - height / 4 * 2.5}
                //     a${height / 4},${height / 4} 0 0 1 ${height / 4},${height / 4}
                //     v${height - height / 4 * 2.5}
                //     a${height / 4},${height / 4} 0 0 1 -${height / 4},${height / 4}
                //     h-${width - height / 4 * 2.5}
                //     a${height / 4},${height / 4} 0 0 1 -${height / 4},-${height / 4}
                //     v-${height - height / 4 * 2.5}
                //     a${height / 4},${height / 4} 0 0 1 ${height / 4},-${height / 4}`)
                    canvas.rect(height, width).radius(height / 4)
                    .fill(gradient).move(startX + this.config.margin + this.shiftX, startY + this.config.margin + this.shiftY);
            }
            return;
        }
        if (this.config.useOpacity) {
            // @ts-ignore
            canvas.path(`M0 0
            h${width}
            v${height}
            h-${width}
            v-${height} Z`)
            // canvas.rect(height, width)
                .fill(gradient).move(startX + this.config.margin + this.shiftX, startY + this.config.margin + this.shiftY).attr({opacity: op});
        } else {
            // @ts-ignore
            canvas.path(`M0 0
            h${width}
            v${height}
            h-${width}
            v-${height} Z`)
            // canvas.rect(height, width)
                .fill(gradient).move(startX + this.config.margin + this.shiftX, startY + this.config.margin + this.shiftY);
        }
    }

    private drawCircle(centerX: number, centerY: number, canvas: object, gradient: string, radiusX: number, radiusY?: number, isMask?: boolean) {
        const op = isMask ? 0.6 : 1;
        if (this.config.useOpacity) {

            // @ts-ignore
            canvas.path(`M 0, 0
            a ${radiusX},${radiusX} 0 1 1 ${radiusX * 2},0
            a ${radiusX},${radiusX} 0 1 1 -${radiusX * 2},0`)
            // canvas.circle().radius(radiusX)
            .fill(gradient).move(centerX + this.config.margin - radiusX + this.shiftX, centerY + this.config.margin - radiusX + this.shiftY).attr({opacity: op});
        } else {
            // @ts-ignore
            canvas.path(`M 0, 0
            a ${radiusX},${radiusX} 0 1 1 ${radiusX * 2},0
            a ${radiusX},${radiusX} 0 1 1 -${radiusX * 2},0`)
            // canvas.circle().radius(radiusX)
            .fill(gradient).move(centerX + this.config.margin - radiusX + this.shiftX, centerY + this.config.margin - radiusX + this.shiftY);
        }
    }

    private drawKite(startX: number, startY: number, context: object, gradient: string, width: number, height: number, isRound?: boolean, isMask?: boolean) {
        const op = isMask ? 0.6 : 1;
        const coordinates = [[startX + width / 2 + this.config.margin + this.shiftX, startY + this.config.margin + this.shiftY],
            [startX + width + this.config.margin + this.shiftX, startY + height / 2 + this.config.margin + this.shiftY],
            [startX + width / 2 + this.config.margin + this.shiftX, startY + height + this.config.margin + this.shiftY],
            [startX + this.config.margin + this.shiftX, startY + height / 2 + this.config.margin + this.shiftY]];
        // @ts-ignore
        const polygon = context.polygon(coordinates);
        // M 50 0 100 100 50 200 0 100 Z
        if (this.config.useOpacity) {
            polygon.fill(gradient).attr({opacity: op});
        } else {
            polygon.fill(gradient);
        }
    }

    private drawDiamond(startX: number, startY: number, context: object, gradient: string, width: number, height: number, isRight?: boolean, isMask?: boolean) {
        const op = isMask ? 0.6 : 1;
        // const coordinates = isRight ? [
        //     [startX + width / 2 + this.config.margin + this.shiftX, startY + this.config.margin + this.shiftY],
        //     [startX + width + this.config.margin + this.shiftX, startY + this.config.margin + this.shiftY],
        //     [startX + width + this.config.margin + this.shiftX, startY + height / 2 + this.config.margin + this.shiftY],
        //     [startX + width / 2 + this.config.margin + this.shiftX, startY + height + this.config.margin + this.shiftY],
        //     [startX + this.config.margin + this.shiftX, startY + height + this.config.margin + this.shiftY],
        //     [startX + this.config.margin + this.shiftX, startY + height / 2 + this.config.margin + this.shiftY],
        // ] : [
        //     [startX + this.config.margin + this.shiftX, startY + this.config.margin + this.shiftY],
        //     [startX + width / 2 + this.config.margin + this.shiftX, startY + this.config.margin + this.shiftY],
        //     [startX + width + this.config.margin + this.shiftX, startY + height / 2 + this.config.margin + this.shiftY],
        //     [startX + width + this.config.margin + this.shiftX, startY + height + this.config.margin + this.shiftY],
        //     [startX + width / 2 + this.config.margin + this.shiftX, startY + height + this.config.margin + this.shiftY],
        //     [startX + this.config.margin + this.shiftX, startY + height / 2 + this.config.margin + this.shiftY],
        // ];
        const d = width/2;
        // const polygon = context.polygon(coordinates);
        // if (this.config.useOpacity) {
        //     polygon.fill(gradient).attr({opacity: op});
        // } else {
        //     polygon.fill(gradient);
        // }
        if (isRight) {
            if (this.config.useOpacity) {
                // @ts-ignore
                context.path(`M${d*2} ${d}h${d}v${d}l-${d} ${d}H${d}v-${d}`)
                    .fill(gradient).move(startX + this.config.margin + this.shiftX, startY + this.config.margin + this.shiftY).attr({opacity: op});
            } else {
                // @ts-ignore
                context.path(`M${d*2} ${d}h${d}v${d}l-${d} ${d}H${d}v-${d}`)
                    .fill(gradient).move(startX + this.config.margin + this.shiftX, startY + this.config.margin + this.shiftY);
            }
        } else {
            if (this.config.useOpacity) {
                // @ts-ignore
                context.path(`M0 0h${d}l${d} ${d}v${d}h-${d}l-${d}-${d}`)
                    .fill(gradient).move(startX + this.config.margin + this.shiftX, startY + this.config.margin + this.shiftY).attr({opacity: op});
            } else {
                // @ts-ignore
                context.path(`M0 0h${d}l${d} ${d}v${d}h-${d}l-${d}-${d}`)
                    .fill(gradient).move(startX + this.config.margin + this.shiftX, startY + this.config.margin + this.shiftY);
            }
        }
    }

    private async drawLeafFrame(startX: number, startY: number, canvas: object, width: number, height: number, isRight: boolean, gradient: string) {
        const moduleSize = this.config.moduleSize;
        const r = startX + width;
        const b = startY + height;
        const radius = moduleSize * 2;

        gradient = this.config.eyeFrameColor ? this.config.eyeFrameColor : await this.getGradientFromCanvas(canvas, startX, startY, width,height);

        if (isRight) {
            // @ts-ignore
            canvas.path(`M0 0 
            h${width - radius * 1.5} 
            v${height - radius * 1.5} 
            a${radius},${radius} 0 0 1 -${radius},${radius} 
            h-${width - radius * 1.5} 
            v-${height - radius * 1.5} 
            a${radius},${radius} 0 0 1 ${radius},-${radius}`)
                .fill('none')
                .move(startX + this.config.margin + this.shiftX + moduleSize / 2, startY + this.config.margin + this.shiftY + moduleSize / 2)
                .stroke({ color: gradient, width: this.config.moduleSize });
        } else {
            // @ts-ignore
            canvas.path(`M0 0 
            h${width - radius * 1.5} 
            a${radius},${radius} 0 0 1 ${radius},${radius} 
            v${height - radius * 1.5} 
            h-${width - radius * 1.5} 
            a${radius},${radius} 0 0 1 -${radius},-${radius} 
            v-${height - radius * 1.5} z`)
                .fill('none')
                .move(startX + this.config.margin + this.shiftX + moduleSize / 2, startY + this.config.margin + this.shiftY + moduleSize / 2)
                .stroke({ color: gradient, width: this.config.moduleSize });
        }

    }

    private async drawCircularFrame(startX: number, startY: number, canvas: object, width: number, height: number, isLarge: boolean, gradient: string) {
        const moduleSize = this.config.moduleSize;

        gradient = this.config.eyeFrameColor ? this.config.eyeFrameColor : await this.getGradientFromCanvas(canvas, startX, startY, width,height);


        // @ts-ignore
        canvas.path(`M 0, 0
        a ${width/2 - moduleSize},${width/2 - moduleSize} 0 1,1 ${width - moduleSize},0
        a ${width/2 - moduleSize},${width/2 - moduleSize} 0 1,1 -${width - moduleSize},0`)
            .fill('none')
            .move(startX + this.config.margin + this.shiftX + moduleSize / 2, startY + this.config.margin + this.shiftY + moduleSize / 2)
            .stroke({ color: gradient, width: this.config.moduleSize });
        // // @ts-ignore
        // canvas.circle().radius(width / 2).fill(gradient).move(startX + this.config.margin + this.shiftX, startY + this.config.margin + this.shiftY);
        // // @ts-ignore
        // canvas.circle().radius(width / 2 - moduleSize).fill(this.config.backgroundColor ? this.config.backgroundColor : '#ffffff').move(startX + this.config.margin + moduleSize + this.shiftX, startY + this.config.margin + moduleSize + this.shiftY);
    }

    private async getGradientFromCanvas(canvas: object, startX: number, startY: number, width: number, height: number) {
        let gradient = this.config.colorDark ? this.config.colorDark : '#000';
        if (this.config.gradientType === GradientType.HORIZONTAL || this.config.gradientType === GradientType.LINEAR) {
            const col1 = await this.getColorFromCanvas(this.canvasQR, startX, startY);
            const col2 = await this.getColorFromCanvas(this.canvasQR, startX + width, startY);
            // @ts-ignore
            gradient = canvas.gradient('linear', (add) => {
                add.stop(0, col1)
                add.stop(1, col2)
            });
        } else if (this.config.gradientType === GradientType.VERTICAL) {
            const col1 = await this.getColorFromCanvas(this.canvasQR, startX, startY);
            const col2 = await this.getColorFromCanvas(this.canvasQR, startX, startY + height);
            // @ts-ignore
            gradient = canvas.gradient('linear', (add) => {
                add.stop(0, col1)
                add.stop(1, col2)
            }).from(0, 0).to(0, 1);
        } else if (this.config.gradientType === GradientType.RADIAL) {

        }

        return gradient;
    }

    private async drawSquareEyeFrame(startX: number, startY: number, canvas: object, width: number, height: number, isRound: boolean, gradient: string) {
        const moduleSize = this.config.moduleSize;
        const radius = height / 4;

        gradient = this.config.eyeFrameColor ? this.config.eyeFrameColor : await this.getGradientFromCanvas(canvas, startX, startY, width,height);

        if (isRound) {
            // @ts-ignore
            canvas.path(`M0 0
            h${width - radius * 2.5}
            a${radius},${radius} 0 0 1 ${radius},${radius}
            v${height - radius * 2.5}
            a${radius},${radius} 0 0 1 -${radius},${radius}
            h-${width - radius * 2.5}
            a${radius},${radius} 0 0 1 -${radius},-${radius}
            v-${height - radius * 2.5}
            a${radius},${radius} 0 0 1 ${radius},-${radius}`)
                .fill('none')
                .move(startX + this.config.margin + this.shiftX + moduleSize / 2, startY + this.config.margin + this.shiftY + moduleSize / 2)
                .stroke({ color: gradient, width: this.config.moduleSize });
            // canvas.rect(height, width).radius(radius).fill(this.config.eyeFrameColor ? this.config.eyeFrameColor : gradient).move(startX + this.config.margin + this.shiftX, startY + this.config.margin + this.shiftY);
            // // @ts-ignore
            // canvas.rect(height - 1.5 * moduleSize, width - 1.5 * moduleSize).radius(radius).fill(this.config.backgroundColor ? this.config.backgroundColor : '#fff').move(startX + moduleSize * 0.75 + this.config.margin + this.shiftX, startY + moduleSize * 0.75 + this.config.margin + this.shiftY);
        } else {
            // @ts-ignore
            canvas.path(`M0 0
            h${width - moduleSize}
            v${height - moduleSize}
            h-${width - moduleSize}
            v-${height - moduleSize} z`)
                .fill('none')
                .move(startX + this.config.margin + this.shiftX + moduleSize / 2, startY + this.config.margin + this.shiftY + moduleSize / 2)
                .stroke({ color: gradient, width: this.config.moduleSize });
            // // @ts-ignore
            // canvas.rect(height, width).fill(this.config.eyeFrameColor ? this.config.eyeFrameColor : gradient).move(startX + this.config.margin + this.shiftX, startY + this.config.margin + this.shiftY);
            // // @ts-ignore
            // canvas.rect(height - 2 * moduleSize, width - 2 * moduleSize).fill(this.config.backgroundColor ? this.config.backgroundColor : '#fff').move(startX + moduleSize + this.config.margin + this.shiftX, startY + moduleSize + this.config.margin + this.shiftY);
        }

    }

    private async drawSquareFrame(startX: number, startY: number, canvas: object, gradient: string | undefined, width: number, height: number) {
        const moduleSize = this.config.moduleSize;
        const backgroundColor = this.config.backgroundColor ? this.config.backgroundColor : '#ffffff';
        const radius = moduleSize;
        // @ts-ignore
        canvas.rect(width, height).fill(gradient ? gradient : '#000000').radius(radius).move(startX, startY);
        // @ts-ignore
        canvas.rect(width - 2 * moduleSize, height - 2 * moduleSize).fill(backgroundColor).radius(radius).move(startX + moduleSize, startY + moduleSize);
    }

    private async drawFrame(canvas: object, frameStyle: QRCodeFrame | undefined, frameColor: string | undefined, frameText: string | undefined) {
        if (!frameStyle || frameStyle === QRCodeFrame.NONE || frameStyle === QRCodeFrame.CIRCULAR) {
            return;
        }

        const color = frameColor ? frameColor : '#000000';
        const moduleSize = this.config.moduleSize;
        const rawSize = this.config.rawSize;
        const size = rawSize + moduleSize * 2;
        const text = frameText ? frameText.toUpperCase() : 'SCAN ME';

        let borderX = 0, borderY = 0, bannerX = 0, bannerY = 0,
            textX = 0, textY = 0, logoX = 0, logoY = 0, cornerRadius = 0;

        if (isNode) {
            const path = require('path');
            const fontPath = path.join(__dirname, '../src/assets/fonts/Roboto');
            // const {setFontDir, setFontFamilyMappings, preloadFonts} = require('svgdom');
            // setFontDir(fontPath);
            // setFontFamilyMappings({'Roboto': 'Roboto-Regular.ttf'});
            // preloadFonts();
        }


        switch (frameStyle) {
            case QRCodeFrame.BANNER_BOTTOM:
                cornerRadius = moduleSize;
                borderX = moduleSize / 2;
                borderY = moduleSize / 2;
                bannerX = moduleSize / 2;
                bannerY = size + moduleSize / 2 - 1;
                textX = size / 3;
                textY = size + 1.5 * moduleSize + size / 10;
                logoX = size / 3 - size / 9;
                logoY = size + moduleSize * 1.5;
                break;
            case QRCodeFrame.BANNER_TOP:
                borderX = moduleSize / 2;
                borderY = moduleSize / 2 + size / 5 - 1;
                bannerX = moduleSize / 2;
                bannerY = moduleSize / 2;
                textX = size / 3;
                textY = 2 * moduleSize + size / 10;
                logoX = size / 3 - size / 9;
                logoY = moduleSize * 2;
                break;
            case QRCodeFrame.BOX_BOTTOM:
                borderX = moduleSize / 2;
                borderY = moduleSize / 2;
                bannerX = moduleSize / 2;
                bannerY = size + moduleSize * 1.5;
                textX = size / 3;
                textY = size + moduleSize * 3 + size / 10;
                logoX = size / 3 - size / 9;
                logoY = size + moduleSize * 3;
                break;
            case QRCodeFrame.BOX_TOP:
                borderX = moduleSize / 2;
                borderY = moduleSize * 1.5 + size / 5;
                bannerX = moduleSize / 2;
                bannerY = moduleSize / 2;
                textX = size / 3;
                textY = 2 * moduleSize + size / 10;
                logoX = size / 3 - size / 9;
                logoY = moduleSize * 2;
                break;
            case QRCodeFrame.BALLOON_BOTTOM:
                borderX = moduleSize / 2;
                borderY = moduleSize / 2;
                bannerX = moduleSize / 2;
                bannerY = size + moduleSize * 2.5;
                textX = size / 3;
                textY = size + 4 * moduleSize + size / 10;
                logoX = size / 3 - size / 9;
                logoY = size + moduleSize * 4;

                if (this.config.isVCard) {
                    bannerY += 4.5 * moduleSize;
                    textY += 5.5 * moduleSize;
                    logoY += 5.5 * moduleSize;
                }
                break;
            case QRCodeFrame.BALLOON_TOP:
                borderX = moduleSize / 2;
                borderY = moduleSize * 1.5 + size / 6;
                bannerX = moduleSize / 2;
                bannerY = moduleSize / 2;
                textX = size / 3;
                textY = this.config.isVCard ? moduleSize * 3 + size / 10 : moduleSize * 2 + size / 10;
                logoX = size / 3 - size / 9;
                logoY = this.config.isVCard ? moduleSize * 3 : moduleSize * 2;
                break;
            default:
                break;
        }

        if (frameStyle !== QRCodeFrame.BALLOON_TOP && frameStyle !== QRCodeFrame.BALLOON_BOTTOM) {
            this.drawSquareFrame(borderX, borderY, canvas, color, size, size);
        }

        if (frameStyle === QRCodeFrame.BALLOON_BOTTOM) {
            const coordinates = [[0, 0], [size / 24, size / 12], [-size / 24, size / 12]];
            // @ts-ignore
            canvas.polygon(coordinates).fill(color).move(size / 2 - moduleSize, size - moduleSize / 2);
        }
        if (frameStyle === QRCodeFrame.BALLOON_TOP) {
            const coordinates = [[0, 0], [size / 24, 0], [0, size / 12], [-size / 24, 0]];
            // @ts-ignore
            canvas.polygon(coordinates).fill(color).move(size / 2 - moduleSize, size / 5 - moduleSize / 2);
        }

        // Banner for frame text
        // @ts-ignore
        canvas.rect(size, size / 5).fill(color).radius(moduleSize)
            .move(bannerX, bannerY);

        if (frameStyle === QRCodeFrame.BANNER_BOTTOM) {
            // @ts-ignore
            canvas.rect(moduleSize, moduleSize * 2).fill(color)
                .move(bannerX, bannerY - moduleSize);

            // @ts-ignore
            canvas.rect(moduleSize, moduleSize * 2).fill(color)
                .move(size - moduleSize / 2, bannerY - moduleSize);
        }
        if (frameStyle === QRCodeFrame.BANNER_TOP) {
            // @ts-ignore
            canvas.rect(moduleSize, moduleSize * 2).fill(color)
                .move(bannerX, bannerY - moduleSize + size / 5);

            // @ts-ignore
            canvas.rect(moduleSize, moduleSize * 2).fill(color)
                .move(size - moduleSize / 2, bannerY - moduleSize + size / 5);
        }
        // @ts-ignore
        canvas.defs().style(`
            @import url('https://fonts.googleapis.com/css?family=Roboto:400');
    `);
        // canvas.fontface('Roboto', `url(https://beaconstacqa.mobstac.com/static/fonts/Roboto-Regular.ttf)`);
        if (this.config.isVCard) {
            // @ts-ignore
            textX = canvas.width()/2 + 5.1 * moduleSize;
            textY = textY + (moduleSize * 2.5)
        } else {
            // @ts-ignore
            textX = canvas.width()/2 + 1.5 * moduleSize;
        }
        // @ts-ignore
        canvas.plain(text).move(textX, textY)
            .font({ fill: '#fff', family: 'Roboto', size: this.config.size / 10, leading: 0, anchor: 'middle'}).attr({y: textY});

        if (this.config.isVCard) {
            // @ts-ignore
            logoX = (canvas.width()/2 - canvas.node.childNodes[canvas.node.childNodes.length - 1].getComputedTextLength()/2) - (this.config.size/13);
            logoY = logoY + (moduleSize * 3.2)
        } else {
            // @ts-ignore
            logoX = (canvas.width()/2 - canvas.node.childNodes[canvas.node.childNodes.length - 1].getComputedTextLength()/2) - (this.config.size/12);
            logoY = logoY + (moduleSize * 0.3)
        }

        const cellphone = cellPhoneSVGPath.replace('<<x-axis>>', String(logoX))
            .replace('<<y-axis>>', String(logoY))
            .replace('<<width>>', String(size / 10))
            .replace('<<height>>', String(size / 10));
        // @ts-ignore
        return canvas.svg(cellphone);

        // return loadImage('https://static.beaconstac.com/assets/img/mobstac-awesome-qr/cellphone.svg').then(image => {
        //
        //     // @ts-ignore
        //     const cn = createCanvas(image.naturalHeight, image.naturalWidth);
        //     const ct = cn.getContext('2d');
        //     ct.drawImage(image, 0, 0);
        //     ct.save();
        //
        //     // @ts-ignore
        //     canvas.image('').size(size / 10, size / 10).move(logoX, logoY).attr({ 'xlink:href': cn.toDataURL() });
        //
        //     // TODO: Use SVG embed
        //     // const cellphone = cellPhoneSVGPath.replace('<<x-axis>>', logoX)
        //     //     .replace('<<y-axis>>', logoY)
        //     //     .replace('<<width>>', size / 10)
        //     //     .replace('<<height>>', size / 10);
        //     // // @ts-ignore
        //     // return canvas.svg(cellphone);
        // });
    }

}



