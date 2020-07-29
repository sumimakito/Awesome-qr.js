/* tslint:disable:no-var-requires */
import { Canvas, CanvasRenderingContext2D, createCanvas } from 'canvas';
import { CanvasUtil } from './Common';
import { CanvasType, DataPattern, EyeBallShape, EyeFrameShape, QRCodeFrame } from './Enums';
import { QRCodeConfig, QRDrawingConfig } from './Types';
import { isNode, loadImage } from './Util';


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

        const drawingConfig: Partial<QRDrawingConfig> = {
            size,
            nSize,
            rawSize: config.size,
            viewportSize,
            margin,
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

    constructor(moduleCount: number, patternPosition: number[], config: QRCodeConfig, isDark: any, modules: Array<Array<boolean | null>>) {
        this.moduleCount = moduleCount;
        this.patternPosition = patternPosition;
        this.isDark = isDark;
        this.modules = modules;
        this.config = SVGDrawing.generateDrawingConfig(config, moduleCount);
        this.isPainted = false;

        const { createSVGWindow } = require('svgdom')
        const svgWindow = createSVGWindow()
        const svgDocument = svgWindow.document
        const { SVG, registerWindow } = require('@svgdotjs/svg.js')

        registerWindow(svgWindow, svgDocument);
        this.canvas = SVG(svgDocument.documentElement).size(config.size, config.size);
    }

    public drawSVG(): Promise<any> {
        const frameStyle = this.config.frameStyle;

        let mainCanvas: object;
        let canvasHeight: number;
        let canvasWidth: number;

        const { createSVGWindow } = require('svgdom')
        const svgWindow = createSVGWindow()
        const svgDocument = svgWindow.document
        const { SVG, registerWindow } = require('@svgdotjs/svg.js')

        if (frameStyle && frameStyle !== QRCodeFrame.NONE) {
            const moduleSize = this.config.moduleSize;
            const rawSize = this.config.rawSize;
            const size = rawSize + moduleSize * 2;
            canvasHeight = 1.265 * size;
            canvasWidth = size + moduleSize;
            if (frameStyle === QRCodeFrame.BANNER_TOP || frameStyle === QRCodeFrame.BANNER_BOTTOM) {
                canvasHeight = 1.216 * size;
            }
            if (frameStyle === QRCodeFrame.BOX_TOP || frameStyle === QRCodeFrame.BOX_BOTTOM) {
                canvasHeight = 1.27 * size;
            }

            mainCanvas = SVG(svgDocument.documentElement).size(canvasWidth, canvasHeight);

            // @ts-ignore
            mainCanvas.viewbox(0, 0, canvasWidth, canvasHeight).fill(this.config.backgroundColor ? this.config.backgroundColor : '#ffffff');

            switch (frameStyle) {
                case QRCodeFrame.BALLOON_BOTTOM:
                    this.shiftX = 1.5 * this.config.moduleSize;
                    this.shiftY = 1.5 * this.config.moduleSize;
                    break
                case QRCodeFrame.BALLOON_TOP:
                    this.shiftX = 1.5 * this.config.moduleSize;
                    this.shiftY = 3.5 * this.config.moduleSize + size / 6;
                    if (this.config.isVCard) {
                        this.shiftY = 10 * moduleSize + size / 6;
                    }
                    break;
                case QRCodeFrame.BOX_BOTTOM:
                    this.shiftX = 1.5 * this.config.moduleSize;
                    this.shiftY = 1.5 * this.config.moduleSize;
                    break;
                case QRCodeFrame.BOX_TOP:
                    this.shiftX = 1.5 * this.config.moduleSize;
                    this.shiftY = 1.5 * this.config.moduleSize  + size / 6 - 1;
                    break;
                case QRCodeFrame.BANNER_BOTTOM:
                    this.shiftX = 1.5 * this.config.moduleSize;
                    this.shiftY = 1.5 * this.config.moduleSize;
                    break;
                case QRCodeFrame.BANNER_TOP:
                    this.shiftX = 1.5 * this.config.moduleSize;
                    this.shiftY = 2.5 * this.config.moduleSize + size / 6;
                    break
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
                return this.addBackground(mainCanvas, this.config.size, this.config.backgroundImage, this.config.backgroundColor)
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
            .then(() => {
                // @ts-ignore
                return mainCanvas.svg();
            });
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

        const color = '#ffffff99';

        return loadImage(this.config.logoImage!, this.config.imageServerURL, this.config.imageServerRequestHeaders).then((image: any) => {

            const cn = createCanvas(image.naturalHeight, image.naturalWidth);
            const ct = cn.getContext('2d');
            ct.drawImage(image, 0, 0);
            ct.save();

            // @ts-ignore
            context.rect(logoSize + logoMargin, logoSize + logoMargin).fill('#ffffff').move(centreCoordinate + this.config.margin + this.shiftX, centreCoordinate + this.config.margin+ this.shiftY).radius(logoCornerRadius)
            // @ts-ignore
            context.image('').size(logoSize, logoSize)
                .attr({'xlink:href': cn.toDataURL()})
                .move(centreCoordinate + logoMargin / 2 + this.config.margin + this.shiftX, centreCoordinate + logoMargin / 2 + this.config.margin + this.shiftY);
        });
    }

    private async addBackground(context: object, size: number, backgroundImage?: string, backgroundColor?: string) {
        if (!backgroundImage) {
            const color = backgroundColor ? backgroundColor : '#ffffff';
            // @ts-ignore
            context.rect(size, size).fill(color).move(this.shiftX, this.shiftY).radius(this.config.moduleSize);
            return;
        }

        return this.addBackgroundImage(context, size, backgroundImage!);
    }

    private async addBackgroundImage(context: object, size: number, backgroundImage: string) {
        return loadImage(backgroundImage, this.config.imageServerURL, this.config.imageServerRequestHeaders).then(image => {

            // @ts-ignore
            const cn = createCanvas(image.naturalHeight, image.naturalWidth);
            const ct = cn.getContext('2d');
            ct.drawImage(image, 0, 0);
            ct.save();

            // @ts-ignore
            context.image('').size(this.config.size, this.config.size).move(this.shiftX, this.shiftY)
                .attr({'xlink:href': cn.toDataURL(), 'opacity': 0.6});

        });
    }

    private fillMargin(context: object) {
        const margin = this.config.margin;
        const size = this.config.size;
        const viewportSize = this.config.viewportSize;

        if (this.config.whiteMargin) {
            const color = '#ffffff99';
            // @ts-ignore
            context.rect(size, margin).fill(color).move(-margin + this.shiftX, -margin + this.shiftY);
            // @ts-ignore
            context.rect(size, margin).fill(color).move(-margin + this.shiftX, viewportSize + this.shiftY);
            // @ts-ignore
            context.rect(margin, size).fill(color).move(viewportSize + this.shiftX, -margin + this.shiftY);
            // @ts-ignore
            context.rect(margin, size).fill(color).move(-margin + this.shiftX, -margin + this.shiftY);
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

    private fillRectWithMask(canvas: object, x: number, y: number, w: number, h: number, bIsDark: boolean, shape: DataPattern) {

        if (!bIsDark) {
            return;
        }

        if (!this.maskCanvas) {
            const color = bIsDark ? this.config.colorDark : this.config.backgroundColor ? this.config.backgroundColor : '#ffffff99';

            switch (shape) {
                case DataPattern.CIRCLE:
                    this.drawCircle(x + w / 2, y + h / 2, canvas, color, h / 2);
                    break;
                case DataPattern.LEFT_DIAMOND:
                    this.drawDiamond(x, y, canvas, color, w, h, false);
                    break;
                case DataPattern.RIGHT_DIAMOND:
                    this.drawDiamond(x, y, canvas, color, w, h, true);
                    break;
                case DataPattern.KITE:
                    this.drawKite(x, y, canvas, color, w, h, false);
                    break;
                default:
                    this.drawSquare(x, y, canvas, w, h, false, color);
                    break;
            }

        } else {
            // TODO: mask canvas
            // canvas.drawImage(this.maskCanvas, x, y, w, h, x, y, w, h);
            const color = bIsDark ? this.config.colorDark : this.config.backgroundColor ? this.config.backgroundColor : '#ffffff99';;
            this.drawSquare(x, y, canvas, w, h, false, color);
        }
    }

    private drawAlignProtectors(context: object) {
        const patternPosition = this.patternPosition;
        const moduleSize = this.config.moduleSize;
        const margin  = this.config.margin;
        const color = this.config.backgroundColor ? this.config.backgroundColor : '#ffffff99';
        const edgeCenter = patternPosition[patternPosition.length - 1];
        for (let i = 0; i < patternPosition.length; i++) {
            for (let j = 0; j < patternPosition.length; j++) {
                const agnX = patternPosition[j];
                const agnY = patternPosition[i];
                if (agnX === 6 && (agnY === 6 || agnY === edgeCenter)) {
                } else if (agnY === 6 && (agnX === 6 || agnX === edgeCenter)) {
                } else if (agnX !== 6 && agnX !== edgeCenter && agnY !== 6 && agnY !== edgeCenter) {
                    CanvasUtil.drawSVGAlignProtector(context, agnX, agnY, moduleSize, moduleSize, margin, color, this.shiftX, this.shiftY);
                } else {
                    CanvasUtil.drawSVGAlignProtector(context, agnX, agnY, moduleSize, moduleSize, margin, color, this.shiftX, this.shiftY);
                }
            }
        }
    }

    private drawPositionProtectors(context: object) {
        const color = this.config.backgroundColor ? this.config.backgroundColor : '#ffffff99';
        const size = this.config.moduleSize;
        const moduleCount = this.moduleCount;

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

    private drawPositionPatterns(context: object, gradient: string) {
        const color = gradient;

        const moduleSize = this.config.moduleSize;
        const moduleCount = this.moduleCount;

        const eyeBallColor = this.config.eyeBallColor ? this.config.eyeBallColor : gradient;
        const eyeBallShape = this.config.eyeBallShape ? this.config.eyeBallShape : EyeBallShape.SQUARE;
        const eyeFrameColor = this.config.eyeFrameColor ? this.config.eyeFrameColor : gradient;
        const eyeFrameShape = this.config.eyeFrameShape ? this.config.eyeFrameShape : EyeFrameShape.SQUARE;
        const dataPattern = this.config.dataPattern ? this.config.dataPattern : DataPattern.SQUARE;

        this.drawEyeFrames(context, eyeFrameShape, eyeFrameColor);
        this.drawEyeBalls(context, eyeBallShape, eyeBallColor);


        for (let i = 0; i < moduleCount - 15; i += 2) {

            switch (dataPattern) {
                case DataPattern.CIRCLE:
                    const radius = moduleSize / 2;
                    this.drawCircle((8 + i) * moduleSize + radius, 6 * moduleSize + radius, context, gradient, radius, radius, false);
                    this.drawCircle(6 * moduleSize + radius, (8 + i) * moduleSize + radius, context, gradient, radius, radius, false);
                    break;
                case DataPattern.KITE:
                    this.drawKite((8 + i) * moduleSize, 6 * moduleSize, context, gradient, moduleSize, moduleSize, false);
                    this.drawKite(6 * moduleSize, (8 + i) * moduleSize, context, gradient, moduleSize, moduleSize, false);
                    break;
                case DataPattern.LEFT_DIAMOND:
                    this.drawDiamond((8 + i) * moduleSize, 6 * moduleSize, context, gradient, moduleSize, moduleSize, false);
                    this.drawDiamond(6 * moduleSize, (8 + i) * moduleSize, context, gradient, moduleSize, moduleSize, false);
                    break;
                case DataPattern.RIGHT_DIAMOND:
                    this.drawDiamond((8 + i) * moduleSize, 6 * moduleSize, context, gradient, moduleSize, moduleSize, true);
                    this.drawDiamond(6 * moduleSize, (8 + i) * moduleSize, context, gradient, moduleSize, moduleSize, true);
                    break;
                default:
                    this.drawSquare((8 + i) * moduleSize, 6 * moduleSize, context, moduleSize, moduleSize, false, gradient);
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
                    this.drawAlign(context, agnX, agnY, moduleSize, moduleSize, dataPattern);
                } else {
                    this.drawAlign(context, agnX, agnY, moduleSize, moduleSize, dataPattern);
                }
            }
        }
    }


    private drawAlign(context: object, centerX: number, centerY: number, nWidth: number, nHeight: number, shape: DataPattern) {
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
        for (let i = 0; i < 4; i++) {
            if (shape === DataPattern.SQUARE) {
                // @ts-ignore
                drawShape(x, y, context, width, height, boolFlag, this.config.colorDark);
            } else {
                // @ts-ignore
                drawShape(x, y, context, this.config.colorDark, width, height, boolFlag);
            }

            y += nHeight;
        }

        x = shape === DataPattern.CIRCLE ? (centerX + 2) * nWidth + nWidth / 2 : (centerX + 2) * nWidth;
        y = shape === DataPattern.CIRCLE ? (centerY - 2 + 1) * nHeight + nHeight / 2 : (centerY - 2 + 1) * nHeight;
        for (let i = 0; i < 4; i++) {
            if (shape === DataPattern.SQUARE) {
                // @ts-ignore
                drawShape(x, y, context, width, height, boolFlag, this.config.colorDark);
            } else {
                // @ts-ignore
                drawShape(x, y, context, this.config.colorDark, width, height, boolFlag);
            }

            y += nHeight;
        }

        x = shape === DataPattern.CIRCLE ? (centerX - 2 + 1) * nWidth + nWidth / 2 : (centerX - 2 + 1) * nWidth;
        y = shape === DataPattern.CIRCLE ? (centerY - 2) * nHeight + nHeight / 2 : (centerY - 2) * nHeight;
        for (let i = 0; i < 4; i++) {
            if (shape === DataPattern.SQUARE) {
                // @ts-ignore
                drawShape(x, y, context, width, height, boolFlag, this.config.colorDark);
            } else {
                // @ts-ignore
                drawShape(x, y, context, this.config.colorDark, width, height, boolFlag);
            }
            x += nWidth;
        }

        x = shape === DataPattern.CIRCLE ? (centerX - 2) * nWidth + nWidth / 2 : (centerX - 2) * nWidth;
        y = shape === DataPattern.CIRCLE ? (centerY + 2) * nHeight + nHeight / 2 : (centerY + 2) * nHeight;
        for (let i = 0; i < 4; i++) {
            if (shape === DataPattern.SQUARE) {
                // @ts-ignore
                drawShape(x, y, context, width, height, boolFlag, this.config.colorDark);
            } else {
                // @ts-ignore
                drawShape(x, y, context, this.config.colorDark, width, height, boolFlag);
            }
            x += nWidth;
        }

        x = shape === DataPattern.CIRCLE ? centerX * nWidth + nWidth / 2 : centerX * nWidth;
        y = shape === DataPattern.CIRCLE ? centerY * nHeight + nHeight / 2 : centerY * nHeight;
        if (shape === DataPattern.SQUARE) {
            // @ts-ignore
            drawShape(x, y, context, width, height, boolFlag, this.config.colorDark);
        } else {
            // @ts-ignore
            drawShape(x, y, context, this.config.colorDark, width, height, boolFlag);
        }
    }

    private drawEyeFrames(context: object, shape: EyeFrameShape, color: string) {
        const moduleSize = this.config.moduleSize;
        const moduleCount = this.moduleCount;

        switch(shape) {
            case EyeFrameShape.SQUARE:
                this.drawSquareEyeFrame(0, 0, context, 7 * moduleSize, 7 * moduleSize, false, color);
                this.drawSquareEyeFrame((moduleCount - 7) * moduleSize, 0, context, 7 * moduleSize, 7 * moduleSize, false, color);
                this.drawSquareEyeFrame(0, (moduleCount - 7) * moduleSize, context, 7 * moduleSize, 7 * moduleSize, false, color);
                break;
            case EyeFrameShape.ROUNDED:
                this.drawSquareEyeFrame(0, 0, context, 7 * moduleSize, 7 * moduleSize, true, color);
                this.drawSquareEyeFrame((moduleCount - 7) * moduleSize, 0, context, 7 * moduleSize, 7 * moduleSize, true, color);
                this.drawSquareEyeFrame(0, (moduleCount - 7) * moduleSize, context, 7 * moduleSize, 7 * moduleSize, true, color);
                break;
            case EyeFrameShape.CIRCLE:
                this.drawCircularFrame(0, 0, context, 7 * moduleSize, 7 * moduleSize, false, color);
                this.drawCircularFrame((moduleCount - 7) * moduleSize, 0, context, 7 * moduleSize, 7 * moduleSize, false, color);
                this.drawCircularFrame(0, (moduleCount - 7) * moduleSize, context, 7 * moduleSize, 7 * moduleSize, false, color);
                break;
            case EyeFrameShape.LEFT_LEAF:
                this.drawLeafFrame(0, 0, context, 7 * moduleSize, 7 * moduleSize, false, color);
                this.drawLeafFrame((moduleCount - 7) * moduleSize, 0, context, 7 * moduleSize, 7 * moduleSize, false, color);
                this.drawLeafFrame(0, (moduleCount - 7) * moduleSize, context, 7 * moduleSize, 7 * moduleSize, false, color);
                break;
            case EyeFrameShape.RIGHT_LEAF:
                this.drawLeafFrame(0, 0, context, 7 * moduleSize, 7 * moduleSize, true, color);
                this.drawLeafFrame((moduleCount - 7) * moduleSize, 0, context, 7 * moduleSize, 7 * moduleSize, true, color);
                this.drawLeafFrame(0, (moduleCount - 7) * moduleSize, context, 7 * moduleSize, 7 * moduleSize, true, color);
                break;
            default:
            this.drawSquareEyeFrame(0, 0, context, 7 * moduleSize, 7 * moduleSize, false, color);
            this.drawSquareEyeFrame((moduleCount - 7) * moduleSize, 0, context, 7 * moduleSize, 7 * moduleSize, false, color);
            this.drawSquareEyeFrame(0, (moduleCount - 7) * moduleSize, context, 7 * moduleSize, 7 * moduleSize, false, color);
            break;
        }

    }

    private drawEyeBalls(context: object, shape: EyeBallShape, color: string) {
        const moduleSize = this.config.moduleSize;
        const moduleCount = this.moduleCount;

        switch (shape) {
            case EyeBallShape.CIRCLE:
                const radius1 = 3 * moduleSize / 2;
                this.drawCircle(2 * moduleSize + radius1, 2 * moduleSize + radius1, context, color, radius1);
                this.drawCircle((moduleCount - 7 + 2) * moduleSize + radius1, 2 * moduleSize + radius1, context, color, radius1);
                this.drawCircle(2 * moduleSize + radius1, (moduleCount - 7 + 2) * moduleSize + radius1, context, color, radius1);
                break;
            case EyeBallShape.ROUNDED:
                this.drawSquare(2 * moduleSize, 2 * moduleSize, context, 3 * moduleSize, 3 * moduleSize, true, color);
                this.drawSquare((moduleCount - 7 + 2) * moduleSize, 2 * moduleSize, context, 3 * moduleSize, 3 * moduleSize, true, color);
                this.drawSquare(2 * moduleSize, (moduleCount - 7 + 2) * moduleSize, context, 3 * moduleSize, 3 * moduleSize, true, color);
                break;
            case EyeBallShape.SQUARE:
                this.drawSquare(2 * moduleSize, 2 * moduleSize, context, 3 * moduleSize, 3 * moduleSize, false, color);
                this.drawSquare((moduleCount - 7 + 2) * moduleSize, 2 * moduleSize, context, 3 * moduleSize, 3 * moduleSize, false, color);
                this.drawSquare(2 * moduleSize, (moduleCount - 7 + 2) * moduleSize, context, 3 * moduleSize, 3 * moduleSize, false, color);
                break;
            case EyeBallShape.LEFT_DIAMOND:
                this.drawDiamond(2 * moduleSize, 2 * moduleSize, context, color,3 * moduleSize, 3 * moduleSize, false);
                this.drawDiamond((moduleCount - 7 + 2) * moduleSize, 2 * moduleSize, context, color, 3 * moduleSize, 3 * moduleSize, false);
                this.drawDiamond(2 * moduleSize, (moduleCount - 7 + 2) * moduleSize, context, color, 3 * moduleSize, 3 * moduleSize, false);
                break;
            case EyeBallShape.RIGHT_DIAMOND:
                this.drawDiamond(2 * moduleSize, 2 * moduleSize, context, color,3 * moduleSize, 3 * moduleSize, true);
                this.drawDiamond((moduleCount - 7 + 2) * moduleSize, 2 * moduleSize, context, color, 3 * moduleSize, 3 * moduleSize, true);
                this.drawDiamond(2 * moduleSize, (moduleCount - 7 + 2) * moduleSize, context, color, 3 * moduleSize, 3 * moduleSize, true);
                break;
            case EyeBallShape.LEFT_LEAF:
                this.drawDiamond(2 * moduleSize, 2 * moduleSize, context, color,3 * moduleSize, 3 * moduleSize, false);
                this.drawDiamond((moduleCount - 7 + 2) * moduleSize, 2 * moduleSize, context, color, 3 * moduleSize, 3 * moduleSize, false);
                this.drawDiamond(2 * moduleSize, (moduleCount - 7 + 2) * moduleSize, context, color, 3 * moduleSize, 3 * moduleSize, false);
                const radius2 = 3 * moduleSize / 2;
                this.drawCircle(2 * moduleSize + radius2, 2 * moduleSize + radius2, context, color, radius2);
                this.drawCircle((moduleCount - 7 + 2) * moduleSize + radius2, 2 * moduleSize + radius2, context, color, radius2);
                this.drawCircle(2 * moduleSize + radius2, (moduleCount - 7 + 2) * moduleSize + radius2, context, color, radius2);
                break;
            case EyeBallShape.RIGHT_LEAF:
                this.drawDiamond(2 * moduleSize, 2 * moduleSize, context, color,3 * moduleSize, 3 * moduleSize, true);
                this.drawDiamond((moduleCount - 7 + 2) * moduleSize, 2 * moduleSize, context, color, 3 * moduleSize, 3 * moduleSize, true);
                this.drawDiamond(2 * moduleSize, (moduleCount - 7 + 2) * moduleSize, context, color, 3 * moduleSize, 3 * moduleSize, true);
                const radius3 = 3 * moduleSize / 2;
                this.drawCircle(2 * moduleSize + radius3, 2 * moduleSize + radius3, context, color, radius3);
                this.drawCircle((moduleCount - 7 + 2) * moduleSize + radius3, 2 * moduleSize + radius3, context, color, radius3);
                this.drawCircle(2 * moduleSize + radius3, (moduleCount - 7 + 2) * moduleSize + radius3, context, color, radius3);
                break;
            default:
                this.drawSquare(2 * moduleSize, 2 * moduleSize, context, 3 * moduleSize, 3 * moduleSize, false, color);
                this.drawSquare((moduleCount - 7 + 2) * moduleSize, 2 * moduleSize, context, 3 * moduleSize, 3 * moduleSize, false, color);
                this.drawSquare(2 * moduleSize, (moduleCount - 7 + 2) * moduleSize, context, 3 * moduleSize, 3 * moduleSize, false, color);
                break;
        }

    }

    private drawSquare(startX: number, startY: number, canvas: object, width: number, height: number, isRound: boolean, gradient: string) {
        if (isRound) {
            // @ts-ignore
            canvas.rect(height, width).radius(height / 4).fill(gradient).move(startX + this.config.margin + this.shiftX, startY + this.config.margin + this.shiftY);
            return;
        }
        // @ts-ignore
        canvas.rect(height, width).fill(gradient).move(startX + this.config.margin + this.shiftX, startY + this.config.margin + this.shiftY);
    }

    private drawCircle(centerX: number, centerY: number, canvas: object, gradient: string, radiusX: number, radiusY?: number, isLarge?: boolean) {
        // @ts-ignore
        canvas.circle().radius(radiusX).fill(gradient).move(centerX + this.config.margin - radiusX + this.shiftX, centerY + this.config.margin - radiusX + this.shiftY);
    }

    private drawKite(startX: number, startY: number, context: object, gradient: string, width: number, height: number, isRound?: boolean) {
        const coordinates = [[startX + width / 2 + this.config.margin + this.shiftX, startY + this.config.margin + this.shiftY],
            [startX + width + this.config.margin + this.shiftX, startY + height / 2 + this.config.margin + this.shiftY],
            [startX + width / 2 + this.config.margin + this.shiftX, startY + height + this.config.margin + this.shiftY],
            [startX + this.config.margin + this.shiftX, startY + height / 2 + this.config.margin + this.shiftY]];
        // @ts-ignore
        const polygon = context.polygon(coordinates)
        polygon.fill(gradient)
    }

    private drawDiamond(startX: number, startY: number, context: object, gradient: string, width: number, height: number, isRight?: boolean) {
        // const c1 = [[0,0], [100,50], [50,100]]
        const coordinates = isRight ? [
            [startX + width / 2 + this.config.margin + this.shiftX, startY + this.config.margin + this.shiftY],
            [startX + width + this.config.margin + this.shiftX, startY + this.config.margin + this.shiftY],
            [startX + width + this.config.margin + this.shiftX, startY + height / 2 + this.config.margin + this.shiftY],
            [startX + width / 2 + this.config.margin + this.shiftX, startY + height + this.config.margin + this.shiftY],
            [startX + this.config.margin + this.shiftX, startY + height + this.config.margin + this.shiftY],
            [startX + this.config.margin + this.shiftX, startY + height / 2 + this.config.margin + this.shiftY]
                ] : [
            [startX + this.config.margin + this.shiftX, startY + this.config.margin + this.shiftY],
            [startX + width / 2 + this.config.margin + this.shiftX, startY + this.config.margin + this.shiftY],
            [startX + width + this.config.margin + this.shiftX, startY + height / 2 + this.config.margin + this.shiftY],
            [startX + width + this.config.margin + this.shiftX, startY + height + this.config.margin + this.shiftY],
            [startX + width / 2 + this.config.margin + this.shiftX, startY + height + this.config.margin + this.shiftY],
            [startX + this.config.margin + this.shiftX, startY + height / 2 + this.config.margin + this.shiftY]
        ];
        // @ts-ignore
        const polygon = context.polygon(coordinates)
        polygon.fill(gradient)
    }

    private drawLeafFrame(startX: number, startY: number, canvas: object, width: number, height: number, isRight: boolean, gradient: string) {
        const moduleSize = this.config.moduleSize;
        const r = startX + width;
        const b = startY + height;
        const radius = moduleSize * 2;

        if (!isRight) {
            this.drawDiamond(startX, startY, canvas, gradient, width, height, false);
            this.drawCircularFrame(startX, startY, canvas, width, height, false, gradient);
            this.drawDiamond(startX + moduleSize, startY + moduleSize, canvas, '#fff', width - moduleSize * 2, height - moduleSize * 2, false);
        } else {
            this.drawDiamond(startX, startY, canvas, gradient, width, height, true);
            this.drawCircularFrame(startX, startY, canvas, width, height, false, gradient);
            this.drawDiamond(startX + moduleSize, startY + moduleSize, canvas, '#fff', width - moduleSize * 2, height - moduleSize * 2, true);
        }

    }

    private drawCircularFrame(startX: number, startY: number, canvas: object, width: number, height: number, isLarge: boolean, gradient: string) {
        const moduleSize = this.config.moduleSize;

        // @ts-ignore
        canvas.circle().radius(width / 2).fill(gradient).move(startX + this.config.margin + this.shiftX, startY + this.config.margin + this.shiftY);
        // @ts-ignore
        canvas.circle().radius(width / 2 - moduleSize).fill(this.config.backgroundColor ? this.config.backgroundColor : '#ffffff').move(startX + this.config.margin + moduleSize + this.shiftX, startY + this.config.margin + moduleSize + this.shiftY);
    }

    private drawSquareEyeFrame(startX: number, startY: number, canvas: object, width: number, height: number, isRound: boolean, gradient: string) {
        const moduleSize = this.config.moduleSize;
        const radius = height / 4;
        if (isRound) {
            // @ts-ignore
            canvas.rect(height, width).radius(radius).fill(this.config.eyeFrameColor ? this.config.eyeFrameColor : this.config.colorDark ? this.config.colorDark : '#000000').move(startX + this.config.margin + this.shiftX, startY + this.config.margin + this.shiftY);
            // @ts-ignore
            canvas.rect(height - 1.5 * moduleSize, width - 1.5 * moduleSize).radius(radius).fill(this.config.backgroundColor ? this.config.backgroundColor : '#fff').move(startX + moduleSize * 0.75 + this.config.margin + this.shiftX, startY + moduleSize * 0.75 + this.config.margin + this.shiftY);
        } else {
            // @ts-ignore
            canvas.rect(height, width).fill(this.config.eyeFrameColor ? this.config.eyeFrameColor : this.config.colorDark ? this.config.colorDark : '#000000').move(startX + this.config.margin + this.shiftX, startY + this.config.margin + this.shiftY);
            // @ts-ignore
            canvas.rect(height - 2 * moduleSize, width - 2 * moduleSize).fill(this.config.backgroundColor ? this.config.backgroundColor : '#fff').move(startX + moduleSize + this.config.margin + this.shiftX, startY + moduleSize + this.config.margin + this.shiftY);
        }

    }

    private get canvasType(): 'svg' | 'pdf' | undefined {
        switch (this.config.canvasType) {
            case CanvasType.SVG:
                return CanvasType.SVG;
            case CanvasType.PDF:
                return CanvasType.PDF;
            default:
                return;
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
        if (!frameStyle || frameStyle === QRCodeFrame.NONE) {
            return;
        }

        const color = frameColor ? frameColor : '#000000';
        const moduleSize = this.config.moduleSize;
        const rawSize = this.config.rawSize;
        const size = rawSize + moduleSize * 2;
        const text = frameText ? frameText : 'SCAN ME';

        let borderX = 0, borderY = 0, bannerX = 0, bannerY = 0,
        textX = 0, textY = 0, logoX = 0, logoY = 0, cornerRadius = 0;

        if (isNode) {
            const path = require('path');
            const fontPath = path.join(__dirname, '../src/assets/fonts/Roboto');
            const {setFontDir, setFontFamilyMappings, preloadFonts} = require('svgdom');
            setFontDir(fontPath);
            setFontFamilyMappings({'Roboto': 'Roboto-Regular.ttf'});
            preloadFonts();
        }



        switch (frameStyle) {
            case QRCodeFrame.BOX_BOTTOM:
                cornerRadius = moduleSize;
                borderX = moduleSize / 2;
                borderY = moduleSize / 2;
                bannerX = moduleSize / 2;
                bannerY = size + moduleSize / 2 - 1;
                textX = size / 3;
                textY = size+ 1 * moduleSize + size / 10;
                logoX = size / 3 - size / 9;
                logoY = size + moduleSize * 1.5;
                break;
            case QRCodeFrame.BOX_TOP:
                borderX = moduleSize / 2;
                borderY = moduleSize / 2 + size / 6 - 1;
                bannerX = moduleSize / 2;
                bannerY = moduleSize / 2;
                textX = size / 3;
                textY =  1.5 * moduleSize + size / 10;
                logoX = size / 3 - size / 9;
                logoY = moduleSize * 2;
                break;
            case QRCodeFrame.BANNER_BOTTOM:
                borderX = moduleSize / 2;
                borderY = moduleSize / 2;
                bannerX = moduleSize / 2;
                bannerY = size + moduleSize * 1.5;
                textX = size / 3;
                textY = size + moduleSize * 2.5 + size / 10;
                logoX = size / 3 - size / 9;
                logoY = size + moduleSize * 3;
                break;
            case QRCodeFrame.BANNER_TOP:
                borderX = moduleSize / 2;
                borderY = moduleSize * 1.5 + size / 6;
                bannerX = moduleSize / 2;
                bannerY = moduleSize / 2;
                textX = size / 3;
                textY =  1.5 * moduleSize + size / 10;
                logoX = size / 3 - size / 9;
                logoY = moduleSize * 2;
                break;
            case QRCodeFrame.BALLOON_BOTTOM:
                borderX = moduleSize / 2;
                borderY = moduleSize / 2;
                bannerX = moduleSize / 2;
                bannerY = size + moduleSize * 2.5;
                textX = size / 3;
                textY = size + 3.5 * moduleSize + size / 10;
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
                textY =  this.config.isVCard ? moduleSize * 2.5 + size / 10 : moduleSize * 1.5 + size / 10;
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
            canvas.polygon(coordinates).fill(color).move(size / 2 - moduleSize, size - moduleSize / 1.5);
        }
        if (frameStyle === QRCodeFrame.BALLOON_TOP) {
            const coordinates = [[0, 0], [size / 24, 0], [0, size / 12], [-size / 24, 0]];
            // @ts-ignore
            canvas.polygon(coordinates).fill(color).move(size / 2 - moduleSize, size / 6 - moduleSize / 2);
        }

        // Banner for frame text
        // @ts-ignore
        canvas.rect(size, size / 6).fill(color).radius(moduleSize)
            .move(bannerX, bannerY);

        if (frameStyle === QRCodeFrame.BOX_BOTTOM) {
            // @ts-ignore
            canvas.rect(moduleSize, moduleSize * 2).fill(color)
                .move(bannerX, bannerY - moduleSize);

            // @ts-ignore
            canvas.rect(moduleSize, moduleSize * 2).fill(color)
                .move(size - moduleSize / 2, bannerY - moduleSize);
        }
        if (frameStyle === QRCodeFrame.BOX_TOP) {
            // @ts-ignore
            canvas.rect(moduleSize, moduleSize * 2).fill(color)
                .move(bannerX, bannerY - moduleSize + size / 6);

            // @ts-ignore
            canvas.rect(moduleSize, moduleSize * 2).fill(color)
                .move(size - moduleSize / 2, bannerY - moduleSize + size / 6);
        }
        // @ts-ignore
        canvas.plain(text).move(textX, textY)
            .font({ fill: '#fff', family: 'Roboto', size: size / 10, leading: 0 });

        return loadImage('https://static.beaconstac.com/assets/img/mobstac-awesome-qr/cellphone.svg').then(image => {

            // @ts-ignore
            const cn = createCanvas(image.naturalHeight, image.naturalWidth);
            const ct = cn.getContext('2d');
            ct.drawImage(image, 0, 0);
            ct.save();

            // @ts-ignore
            canvas.image('').size(size / 10, size / 10).move(logoX, logoY).attr({'xlink:href': cn.toDataURL()});
        });
    }

}

