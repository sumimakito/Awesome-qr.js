/* tslint:disable:no-var-requires */
import { Canvas, CanvasRenderingContext2D, createCanvas, JPEGStream, PDFStream, PNGStream, registerFont } from 'canvas';
import { BCH, CanvasUtil, QRMath, Util } from './Common';
import * as constants from './Constants';
import {
    CanvasType,
    DataPattern,
    EyeBallShape,
    EyeFrameShape,
    GradientType,
    QRCodeFrame,
    QRErrorCorrectLevel,
    QRMode,
} from './Enums';
import { QRCodeConfig, QRDrawingConfig } from './Types';
import { isNode, loadImage } from './Util';

if (isNode) {
    const path = require('path');
    const fontPath = path.join(__dirname, '../src/assets/fonts/Roboto/Roboto-Regular.ttf');
    registerFont(fontPath, { family: 'Roboto' });
}

const { createSVGWindow } = require('svgdom')
const svgWindow = createSVGWindow()
const svgDocument = svgWindow.document
const { SVG, registerWindow } = require('@svgdotjs/svg.js')

export const generateSVG = () => {
    // register window and document
    registerWindow(svgWindow, svgDocument);

    // create canvas
    const canvas = SVG(svgDocument.documentElement).size(200, 200);

    // use svg.js as normal
    canvas.rect(100, 100).fill('yellow').move(50,50);

    return canvas.svg();
}

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

    constructor(moduleCount: number, patternPosition: number[], config: QRCodeConfig, isDark: any, modules: Array<Array<boolean | null>>) {
        this.moduleCount = moduleCount;
        this.patternPosition = patternPosition;
        this.isDark = isDark;
        this.modules = modules;
        this.config = SVGDrawing.generateDrawingConfig(config, moduleCount);
        this.isPainted = false;
        // this.canvas = createCanvas(config.size, config.size, this.canvasType);

        // this.context = this.canvas.getContext('2d');
        registerWindow(svgWindow, svgDocument);
        this.canvas = SVG(svgDocument.documentElement).size(config.size, config.size);
    }

    public drawSVG() {

        const mainCanvas = SVG(svgDocument.documentElement).size(this.config.size, this.config.size);

        const gradient: string = this.config.colorDark;



        this.addBackground(mainCanvas, this.config.size, this.config.backgroundImage, this.config.backgroundColor)
        this.drawPositionProtectors(mainCanvas);
        this.drawAlignProtectors(mainCanvas);
        this.drawAlignPatterns(mainCanvas, gradient);
        this.drawPositionPatterns(mainCanvas, gradient);
        this.drawLogoImage(mainCanvas);
        console.log(mainCanvas.children().length)

        // const image = mainCanvas.image('https://static.beaconstac.com/assets/img/mobstac-awesome-qr/icons/small-icons/logo.svg')
        // image.size(100, 100).move(20, 20)
        // mainCanvas.rect(100, 100).fill(gradient).move(this.config.margin / 10, this.config.margin / 10);


        return mainCanvas.svg();
    }

    public draw(): Promise<Canvas | null> {

        return Promise.resolve(null);

        // const mainCanvas = createCanvas(this.config.size, this.config.size, this.canvasType);
        // const mainContext = mainCanvas.getContext('2d');
        //
        // const gradient: CanvasGradient | string = this.config.colorDark;

        // switch (this.config.gradientType) {
        //     case GradientType.NONE:
        //         gradient = this.config.colorDark;
        //         break;
        //     case GradientType.LINEAR:
        //         gradient = mainContext.createLinearGradient(0, 0, this.config.moduleSize * this.moduleCount, 0);
        //         gradient.addColorStop(0, this.config.colorDark);
        //         gradient.addColorStop(1, this.config.colorLight);
        //         break;
        //     case GradientType.HORIZONTAL:
        //         gradient = mainContext.createLinearGradient(0, 0, this.config.moduleSize * this.moduleCount, 0);
        //         gradient.addColorStop(0, this.config.colorDark);
        //         gradient.addColorStop(1, this.config.colorLight);
        //         break;
        //     case GradientType.VERTICAL:
        //         gradient = mainContext.createLinearGradient(0, 0, 0, this.config.moduleSize * this.moduleCount);
        //         gradient.addColorStop(0, this.config.colorDark);
        //         gradient.addColorStop(1, this.config.colorLight);
        //         break;
        //     case GradientType.RADIAL:
        //         gradient = mainContext.createRadialGradient(
        //             (this.config.moduleSize * this.moduleCount) / 2,
        //             (this.config.moduleSize * this.moduleCount) / 2,
        //             (this.config.moduleSize * this.moduleCount) / 6,
        //             (this.config.moduleSize * this.moduleCount) / 2,
        //             (this.config.moduleSize * this.moduleCount) / 2,
        //             (this.config.moduleSize * this.moduleCount) / 2,
        //         );
        //         gradient.addColorStop(0, this.config.colorLight);
        //         gradient.addColorStop(1, this.config.colorDark);
        //         break;
        //     default:
        //         gradient = this.config.colorDark;
        //         break;
        // }

        // Leave room for margin
        // mainContext.translate(this.config.margin, this.config.margin);
        // mainContext.save();
        //
        // const backgroundCanvas = createCanvas(this.config.size, this.config.size, this.canvasType);
        // const backgroundContext = backgroundCanvas.getContext('2d');
        //
        // return this.addBackground(backgroundContext, this.config.size, this.config.backgroundImage, this.config.backgroundColor)
        //     .then(() => {
        //         return this.drawAlignPatterns(mainContext, gradient);
        //     })
        //     .then(() => {
        //         return this.drawPositionProtectors(mainContext);
        //     })
        //     .then(() => {
        //         return this.drawAlignProtectors(mainContext);
        //     })
        //     .then(() => {
        //         return this.drawPositionPatterns(mainContext, gradient);
        //     })
        //     .then(() => {
        //         return this.fillMargin(mainContext);
        //     })
            // .then(() => {
            //     return this.drawLogoImage(mainContext);
            // })
            // .then(() => {
            //     // Swap and merge the foreground and the background
            //     const size = this.config.size;
            //     const margin = this.config.margin;
            //     backgroundContext.drawImage(mainCanvas, 0, 0, size, size);
            //     mainContext.drawImage(backgroundCanvas, -margin, -margin, size, size);
            //     return this.scaleFinalImage(mainCanvas);
            // })
            // .then((canvas: Canvas) => {
            //     return this.drawFrame(canvas, this.config.frameStyle, this.config.frameColor, this.config.frameText);
            // })
            // .then((canvas: Canvas) => {
            //     this.isPainted = true;
            //     return canvas;
            // });
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
        // context.restore();

        const logoSize = this.config.viewportSize * logoScale;

        const mainMargin = this.config.margin;
        const coordinate = 0.5 * (this.config.size - logoSize);
        const centreCoordinate = coordinate - logoMargin - mainMargin;

        const color = '#ffffff';
        // context.save();
        // CanvasUtil.prepareRoundedCornerClipSVG(context, centreCoordinate, centreCoordinate, logoSize + 2 * logoMargin, logoSize + 2 * logoMargin, logoCornerRadius);
        // context.clip();
        // context.fill();
        // context.restore();

        // context.save();

        // @ts-ignore
        context.rect(logoSize + logoMargin, logoSize + logoMargin).fill('#ffffff').move(centreCoordinate + this.config.margin, centreCoordinate + this.config.margin).radius(10)
        // @ts-ignore
        context.image('https://static.beaconstac.com/assets/img/mobstac-awesome-qr/icons/small-icons/logo.svg').size(logoSize, logoSize).move(centreCoordinate + logoMargin + this.config.margin, centreCoordinate + logoMargin + this.config.margin);

        return loadImage(this.config.logoImage!, this.config.imageServerURL, this.config.imageServerRequestHeaders).then((image: any) => {
            // CanvasUtil.prepareRoundedCornerClipSVG(context, centreCoordinate + logoMargin, centreCoordinate + logoMargin, logoSize, logoSize, logoCornerRadius);
            // context.clip();
            // context.drawImage(image, centreCoordinate + logoMargin, centreCoordinate + logoMargin, logoSize, logoSize);
            // context.restore();
            // @ts-ignore
            context.image('https://static.beaconstac.com/assets/img/mobstac-awesome-qr/icons/small-icons/logo.svg').size(10, 10).move(10, 10)
        });
    }

    private addBackground(context: object, size: number, backgroundImage?: string, backgroundColor?: string) {
        // if (!backgroundImage) {
            const color = backgroundColor ? backgroundColor : '#ffffff';
            // @ts-ignore
            context.rect(size, size).fill(color).move(0, 0);
            return;
        // }

        // return this.addBackgroundImage(context, size, backgroundImage!);
    }

    private fillMargin(context: CanvasRenderingContext2D) {
        const margin = this.config.margin;
        const size = this.config.size;
        const viewportSize = this.config.viewportSize;

        if (this.config.whiteMargin) {
            context.fillStyle = '#ffffff';
            context.fillRect(-margin, -margin, size, margin);
            context.fillRect(-margin, viewportSize, size, margin);
            context.fillRect(viewportSize, -margin, margin, size);
            context.fillRect(-margin, -margin, margin, size);
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

                // context.strokeStyle = bIsDark ? gradient : this.config.colorLight;
                // context.lineWidth = 0.5;
                // context.fillStyle = bIsDark ? gradient : this.config.backgroundImage ? 'rgba(255, 255, 255, 0.6)' : this.config.backgroundColor ? this.config.backgroundColor : 'rgba(255, 255, 255, 0.6)';

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
        if (!this.maskCanvas) {
            const color = bIsDark ? '#000' : '#fff';
                    this.drawSquare(x, y, canvas, w, h, false, color);

        } else {
            const color = bIsDark ? '#000' : '#fff';
            this.drawSquare(x, y, canvas, w, h, false, color);
        }
    }

    private drawAlignProtectors(context: object) {
        const patternPosition = this.patternPosition;
        const moduleSize = this.config.moduleSize;
        const margin  = this.config.margin;
        const edgeCenter = patternPosition[patternPosition.length - 1];
        for (let i = 0; i < patternPosition.length; i++) {
            for (let j = 0; j < patternPosition.length; j++) {
                const agnX = patternPosition[j];
                const agnY = patternPosition[i];
                if (agnX === 6 && (agnY === 6 || agnY === edgeCenter)) {
                } else if (agnY === 6 && (agnX === 6 || agnX === edgeCenter)) {
                } else if (agnX !== 6 && agnX !== edgeCenter && agnY !== 6 && agnY !== edgeCenter) {
                    CanvasUtil.drawSVGAlignProtector(context, agnX, agnY, moduleSize, moduleSize, margin);
                } else {
                    CanvasUtil.drawSVGAlignProtector(context, agnX, agnY, moduleSize, moduleSize, margin);
                }
            }
        }
    }

    private drawPositionProtectors(context: object) {
        const color = '#ffffff';
        // context.fillStyle = this.config.backgroundImage ? 'rgba(255, 255, 255, 0.6)' : this.config.backgroundColor ? this.config.backgroundColor : 'rgba(255, 255, 255, 0.6)';
        const size = this.config.moduleSize;
        const moduleCount = this.moduleCount;

        // @ts-ignore
        context.rect(8 * size, 8 * size).fill(color).move(0 + this.config.margin, 0 + this.config.margin);
        // @ts-ignore
        context.rect(8 * size, 8 * size).fill(color).move(0 + this.config.margin, (moduleCount - 8) * size + this.config.margin);
        // @ts-ignore
        context.rect(8 * size, 8 * size).fill(color).move((moduleCount - 8) * size + this.config.margin, 0 + this.config.margin);
        // @ts-ignore
        context.rect((moduleCount - 8 - 8) * size, size).fill(color).move(8 * size + this.config.margin, 6 * size + this.config.margin);
        // @ts-ignore
        context.rect(size, (moduleCount - 8 - 8) * size).fill(color).move(6 * size + this.config.margin, 8 * size + this.config.margin);
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

                    this.drawSquare((8 + i) * moduleSize, 6 * moduleSize, context, moduleSize, moduleSize, false, gradient);
                    this.drawSquare(6 * moduleSize, (8 + i) * moduleSize, context, moduleSize, moduleSize, false, gradient);

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
                    // context.fillStyle = gradient;
                    this.drawAlign(context, agnX, agnY, moduleSize, moduleSize, dataPattern);
                } else {
                    // context.fillStyle = gradient;
                    this.drawAlign(context, agnX, agnY, moduleSize, moduleSize, dataPattern);
                }
            }
        }
    }


    private drawAlign(context: object, centerX: number, centerY: number, nWidth: number, nHeight: number, shape: DataPattern) {
        let drawShape;
        const boolFlag: boolean = false;
        drawShape = this.drawSquare.bind(this);

        let x = shape === DataPattern.CIRCLE ? (centerX - 2) * nWidth + nWidth / 2 : (centerX - 2) * nWidth;
        let y = shape === DataPattern.CIRCLE ? (centerY - 2) * nHeight + nHeight / 2 : (centerY - 2) * nHeight;
        const height = shape === DataPattern.CIRCLE ? nHeight / 2 : nHeight;
        const width = shape === DataPattern.CIRCLE ? nWidth / 2 : nWidth;
        for (let i = 0; i < 4; i++) {
            drawShape(x, y, context, width, height, boolFlag, this.config.colorDark);
            y += nHeight;
        }

        x = shape === DataPattern.CIRCLE ? (centerX + 2) * nWidth + nWidth / 2 : (centerX + 2) * nWidth;
        y = shape === DataPattern.CIRCLE ? (centerY - 2 + 1) * nHeight + nHeight / 2 : (centerY - 2 + 1) * nHeight;
        for (let i = 0; i < 4; i++) {
            drawShape(x, y, context, width, height, boolFlag, this.config.colorDark);
            y += nHeight;
        }

        x = shape === DataPattern.CIRCLE ? (centerX - 2 + 1) * nWidth + nWidth / 2 : (centerX - 2 + 1) * nWidth;
        y = shape === DataPattern.CIRCLE ? (centerY - 2) * nHeight + nHeight / 2 : (centerY - 2) * nHeight;
        for (let i = 0; i < 4; i++) {
            drawShape(x, y, context, width, height, boolFlag, this.config.colorDark);
            x += nWidth;
        }

        x = shape === DataPattern.CIRCLE ? (centerX - 2) * nWidth + nWidth / 2 : (centerX - 2) * nWidth;
        y = shape === DataPattern.CIRCLE ? (centerY + 2) * nHeight + nHeight / 2 : (centerY + 2) * nHeight;
        for (let i = 0; i < 4; i++) {
            drawShape(x, y, context, width, height, boolFlag, this.config.colorDark);
            x += nWidth;
        }

        x = shape === DataPattern.CIRCLE ? centerX * nWidth + nWidth / 2 : centerX * nWidth;
        y = shape === DataPattern.CIRCLE ? centerY * nHeight + nHeight / 2 : centerY * nHeight;
        drawShape(x, y, context, width, height, boolFlag, this.config.colorDark);
    }

    private drawEyeFrames(context: object, shape: EyeFrameShape, color: string) {
        const moduleSize = this.config.moduleSize;
        const moduleCount = this.moduleCount;

                this.drawSquareEyeFrame(0, 0, context, 7 * moduleSize, 7 * moduleSize, false, color);
                this.drawSquareEyeFrame((moduleCount - 7) * moduleSize, 0, context, 7 * moduleSize, 7 * moduleSize, false, color);
                this.drawSquareEyeFrame(0, (moduleCount - 7) * moduleSize, context, 7 * moduleSize, 7 * moduleSize, false, color);

    }

    private drawEyeBalls(context: object, shape: EyeBallShape, color: string) {
        const moduleSize = this.config.moduleSize;
        const moduleCount = this.moduleCount;

                this.drawSquare(2 * moduleSize, 2 * moduleSize, context, 3 * moduleSize, 3 * moduleSize, false, color);
                this.drawSquare((moduleCount - 7 + 2) * moduleSize, 2 * moduleSize, context, 3 * moduleSize, 3 * moduleSize, false, color);
                this.drawSquare(2 * moduleSize, (moduleCount - 7 + 2) * moduleSize, context, 3 * moduleSize, 3 * moduleSize, false, color);

    }

    private drawSquare(startX: number, startY: number, canvas: object, width: number, height: number, isRound: boolean, gradient: string) {
        // console.log(gradient)
        if (isRound) {
            // @ts-ignore
            canvas.rect(height, width).fill(gradient).move(startX, startY).radius(100);
        }
        // startX = startX + this.config.margin
        // startY = startY + this.config.margin
        // @ts-ignore
        canvas.rect(height, width).fill(gradient).move(startX + this.config.margin, startY + this.config.margin);
    }

    private drawSquareEyeFrame(startX: number, startY: number, canvas: object, width: number, height: number, isRound: boolean, gradient: string) {
        const moduleSize = this.config.moduleSize;
        // @ts-ignore
        canvas.rect(height, width).fill('#000').move(startX + this.config.margin, startY + this.config.margin);
        // @ts-ignore
        canvas.rect(height - 2 * moduleSize, width - 2 * moduleSize).fill('#fff').move(startX + moduleSize + this.config.margin, startY + moduleSize + this.config.margin);
    }
}
