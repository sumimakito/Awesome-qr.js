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

import { SVGDrawing } from './Svg';

if (isNode) {
    const path = require('path');
    const fontPath = path.join(__dirname, '../src/assets/fonts/Roboto/Roboto-Regular.ttf');
    registerFont(fontPath, { family: 'Roboto' });
}


export class QRPolynomial {
    public num: number[];

    constructor(num: number[], shift: number) {
        let offset = 0;
        while (offset < num.length && num[offset] === 0) {
            offset++;
        }
        this.num = new Array(num.length - offset + shift);
        for (let i = 0; i < num.length - offset; i++) {
            this.num[i] = num[i + offset];
        }
    }

    public get(index: number) {
        return this.num[index];
    }

    public getLength() {
        return this.num.length;
    }

    public multiply(e: QRPolynomial): QRPolynomial {
        const num = new Array(this.getLength() + e.getLength() - 1);
        for (let i = 0; i < this.getLength(); i++) {
            for (let j = 0; j < e.getLength(); j++) {
                num[i + j] ^= QRMath.gexp(QRMath.glog(this.get(i)) + QRMath.glog(e.get(j)));
            }
        }
        return new QRPolynomial(num, 0);
    }

    public mod(e: QRPolynomial): QRPolynomial {
        let i;
        if (this.getLength() - e.getLength() < 0) {
            return this;
        }
        const ratio = QRMath.glog(this.get(0)) - QRMath.glog(e.get(0));
        const num = new Array(this.getLength());
        for (i = 0; i < this.getLength(); i++) {
            num[i] = this.get(i);
        }
        for (i = 0; i < e.getLength(); i++) {
            num[i] ^= QRMath.gexp(QRMath.glog(e.get(i)) + ratio);
        }
        return new QRPolynomial(num, 0).mod(e);
    }
}

export class QRCode {
    public static PAD0 = 0xec;
    public static PAD1 = 0x11;

    public static createData(typeNumber: number, errorCorrectLevel: number, dataList: any[]) {
        let i;
        const rsBlocks = QRRSBlock.getQRSBlocks(typeNumber, errorCorrectLevel);
        const buffer = new QRBitBuffer();
        for (i = 0; i < dataList.length; i++) {
            const data = dataList[i];
            buffer.put(data.mode, 4);
            buffer.put(data.getLength(), Util.getLengthInBits(data.mode, typeNumber));
            data.write(buffer);
        }
        let totalDataCount = 0;
        for (i = 0; i < rsBlocks.length; i++) {
            totalDataCount += rsBlocks[i].dataCount;
        }
        if (buffer.getLengthInBits() > totalDataCount * 8) {
            throw new Error('code length overflow. (' + buffer.getLengthInBits() + '>' + totalDataCount * 8 + ')');
        }
        if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
            buffer.put(0, 4);
        }
        while (buffer.getLengthInBits() % 8 !== 0) {
            buffer.putBit(!1);
        }
        while (!0) {
            if (buffer.getLengthInBits() >= totalDataCount * 8) {
                break;
            }
            buffer.put(QRCode.PAD0, 8);
            if (buffer.getLengthInBits() >= totalDataCount * 8) {
                break;
            }
            buffer.put(QRCode.PAD1, 8);
        }
        return QRCode.createBytes(buffer, rsBlocks);
    }

    public static createBytes(buffer: QRBitBuffer, rsBlocks: QRRSBlock[]) {
        let i;
        let r;
        let offset = 0;
        let maxDcCount = 0;
        let maxEcCount = 0;
        const dcdata = new Array(rsBlocks.length);
        const ecdata = new Array(rsBlocks.length);
        for (r = 0; r < rsBlocks.length; r++) {
            const dcCount = rsBlocks[r].dataCount;
            const ecCount = rsBlocks[r].totalCount - dcCount;
            maxDcCount = Math.max(maxDcCount, dcCount);
            maxEcCount = Math.max(maxEcCount, ecCount);
            dcdata[r] = new Array(dcCount);
            for (i = 0; i < dcdata[r].length; i++) {
                dcdata[r][i] = 0xff & buffer.buffer[i + offset];
            }
            offset += dcCount;
            const rsPoly = Util.getErrorCorrectPolynomial(ecCount);
            const rawPoly = new QRPolynomial(dcdata[r], rsPoly.getLength() - 1);
            const modPoly = rawPoly.mod(rsPoly);
            ecdata[r] = new Array(rsPoly.getLength() - 1);
            for (i = 0; i < ecdata[r].length; i++) {
                const modIndex = i + modPoly.getLength() - ecdata[r].length;
                ecdata[r][i] = modIndex >= 0 ? modPoly.get(modIndex) : 0;
            }
        }
        let totalCodeCount = 0;
        for (i = 0; i < rsBlocks.length; i++) {
            totalCodeCount += rsBlocks[i].totalCount;
        }
        const data = new Array(totalCodeCount);
        let index = 0;
        for (i = 0; i < maxDcCount; i++) {
            for (r = 0; r < rsBlocks.length; r++) {
                if (i < dcdata[r].length) {
                    data[index++] = dcdata[r][i];
                }
            }
        }
        for (i = 0; i < maxEcCount; i++) {
            for (r = 0; r < rsBlocks.length; r++) {
                if (i < ecdata[r].length) {
                    data[index++] = ecdata[r][i];
                }
            }
        }
        return data;
    }

    public typeNumber: number;
    public errorCorrectLevel: QRErrorCorrectLevel;
    public modules: Array<Array<boolean | null>> = [[]];
    public moduleCount: number = 0;
    public dataCache?: any[];
    public dataList: QR8bitByte[] = [];
    public drawing: Drawing;
    public svgDrawing: SVGDrawing;
    // @ts-ignore
    public canvas: Canvas;
    public svg: any = '';

    private config: QRCodeConfig;

    constructor(typeNumber: number, config: QRCodeConfig) {
        this.typeNumber = typeNumber;
        this.config = config;
        this.errorCorrectLevel = config.correctLevel;
        this.addData(config.text);
        this.make();
        this.drawing = new Drawing(this.moduleCount, this.patternPosition, config, this.isDark, this.modules);
        this.svgDrawing = new SVGDrawing(this.moduleCount, this.patternPosition, config, this.isDark, this.modules);
    }

    get patternPosition() {
        return constants.PATTERN_POSITION_TABLE[this.typeNumber - 1];
    }

    get canvasType(): CanvasType {
        return this.config.canvasType || CanvasType.PNG;
    }

    public addData(data: string) {
        const newData = new QR8bitByte(data);
        this.dataList.push(newData);
        this.dataCache = undefined;
    }

    public toBuffer(): Buffer {
        if (this.config.canvasType === CanvasType.SVG && !this.config.useCanvas) {
            return this.svg;
        }
        let drawing = this.canvas.toBuffer();
        switch (this.config.canvasType) {
            case CanvasType.PDF:
                drawing = this.canvas.toBuffer('application/pdf');
                break;
            case CanvasType.SVG:
                drawing = this.canvas.toBuffer();
                break;
            default:
                throw { error: `Cannot convert to buffer for ${this.config.canvasType}` };
        }
        return drawing;
    }

    public createStream(config?: object): PNGStream | JPEGStream | PDFStream {
        switch (this.config.canvasType) {
            case CanvasType.PDF:
                return this.canvas.createPDFStream(config);
            case CanvasType.PNG:
                return this.canvas.createPNGStream(config);
            case CanvasType.JPEG:
                return this.canvas.createJPEGStream(config);
            default:
                throw { error: `Cannot create stream for ${this.config.canvasType}` };
        }
    }

    public toDataURL(): string {
        switch (this.config.canvasType) {
            case CanvasType.PNG:
                return this.canvas.toDataURL('image/png');
            case CanvasType.JPEG:
                return this.canvas.toDataURL('image/jpeg');
            default:
                throw { error: `Cannot convert to dataURL for ${this.config.canvasType}` };
        }
    }

    public isDark(row: number, col: number) {
        if (row < 0 || this.moduleCount <= row || col < 0 || this.moduleCount <= col) {
            throw new Error(row + ',' + col);
        }
        return this.modules[row][col];
    }

    public make() {
        if (this.typeNumber < 1) {
            let typeNumber;
            for (typeNumber = 1; typeNumber < 40; typeNumber++) {
                let i;
                const rsBlocks = QRRSBlock.getQRSBlocks(typeNumber, this.errorCorrectLevel);

                const buffer = new QRBitBuffer();
                let totalDataCount = 0;
                for (i = 0; i < rsBlocks.length; i++) {
                    totalDataCount += rsBlocks[i].dataCount;
                }

                for (i = 0; i < this.dataList.length; i++) {
                    const data = this.dataList[i];
                    buffer.put(data.mode, 4);
                    buffer.put(data.getLength(), Util.getLengthInBits(data.mode, typeNumber));
                    data.write(buffer);
                }
                if (buffer.getLengthInBits() <= totalDataCount * 8) {
                    break;
                }
            }
            this.typeNumber = typeNumber;
        }
        this.makeImpl(!1, this.getBestMaskPattern());
    }

    private makeImpl(test: boolean, maskPattern: number) {
        this.moduleCount = this.typeNumber * 4 + 17;
        this.modules = new Array(this.moduleCount);
        for (let row = 0; row < this.moduleCount; row++) {
            this.modules[row] = new Array(this.moduleCount);
            for (let col = 0; col < this.moduleCount; col++) {
                this.modules[row][col] = null;
            }
        }
        this.setupPositionProbePattern(0, 0);
        this.setupPositionProbePattern(this.moduleCount - 7, 0);
        this.setupPositionProbePattern(0, this.moduleCount - 7);
        this.setupPositionAdjustPattern();
        this.setupTimingPattern();
        this.setupTypeInfo(test, maskPattern);
        if (this.typeNumber >= 7) {
            this.setupTypeNumber(test);
        }
        if (this.dataCache == null) {
            this.dataCache = QRCode.createData(this.typeNumber, this.errorCorrectLevel, this.dataList);
        }
        this.mapData(this.dataCache, maskPattern);
    }

    private setupPositionProbePattern(row: number, col: number) {
        for (let r = -1; r <= 7; r++) {
            if (row + r <= -1 || this.moduleCount <= row + r) {
                continue;
            }
            for (let c = -1; c <= 7; c++) {
                if (col + c <= -1 || this.moduleCount <= col + c) {
                    continue;
                }
                if ((0 <= r && r <= 6 && (c === 0 || c === 6)) || (0 <= c && c <= 6 && (r === 0 || r === 6)) || (2 <= r && r <= 4 && 2 <= c && c <= 4)) {
                    this.modules[row + r][col + c] = !0;
                } else {
                    this.modules[row + r][col + c] = !1;
                }
            }
        }
    }

    private getBestMaskPattern() {
        let minLostPoint = 0;
        let pattern = 0;
        for (let i = 0; i < 8; i++) {
            this.makeImpl(!0, i);
            const lostPoint = Util.getLostPoint(this);
            if (i === 0 || minLostPoint > lostPoint) {
                minLostPoint = lostPoint;
                pattern = i;
            }
        }
        return pattern;
    }

    private setupTimingPattern() {
        for (let r = 8; r < this.moduleCount - 8; r++) {
            if (this.modules[r][6] != null) {
                continue;
            }
            this.modules[r][6] = r % 2 === 0;
        }
        for (let c = 8; c < this.moduleCount - 8; c++) {
            if (this.modules[6][c] != null) {
                continue;
            }
            this.modules[6][c] = c % 2 === 0;
        }
    }

    private setupPositionAdjustPattern() {
        const pos = this.patternPosition;
        for (let i = 0; i < pos.length; i++) {
            for (let j = 0; j < pos.length; j++) {
                const row = pos[i];
                const col = pos[j];
                if (this.modules[row][col] != null) {
                    continue;
                }
                for (let r = -2; r <= 2; r++) {
                    for (let c = -2; c <= 2; c++) {
                        if (r === -2 || r === 2 || c === -2 || c === 2 || (r === 0 && c === 0)) {
                            this.modules[row + r][col + c] = !0;
                        } else {
                            this.modules[row + r][col + c] = !1;
                        }
                    }
                }
            }
        }
    }

    private setupTypeNumber(test: boolean) {
        let i;
        let mod;
        const bits = BCH.typeNumber(this.typeNumber);
        for (i = 0; i < 18; i++) {
            mod = !test && ((bits >> i) & 1) === 1;
            this.modules[Math.floor(i / 3)][(i % 3) + this.moduleCount - 8 - 3] = mod;
        }
        for (i = 0; i < 18; i++) {
            mod = !test && ((bits >> i) & 1) === 1;
            this.modules[(i % 3) + this.moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
        }
    }

    private setupTypeInfo(test: boolean, maskPattern: number) {
        let i;
        let mod;
        const data = (this.errorCorrectLevel << 3) | maskPattern;
        const bits = BCH.typeInfo(data);
        for (i = 0; i < 15; i++) {
            mod = !test && ((bits >> i) & 1) === 1;
            if (i < 6) {
                this.modules[i][8] = mod;
            } else if (i < 8) {
                this.modules[i + 1][8] = mod;
            } else {
                this.modules[this.moduleCount - 15 + i][8] = mod;
            }
        }
        for (i = 0; i < 15; i++) {
            mod = !test && ((bits >> i) & 1) === 1;
            if (i < 8) {
                this.modules[8][this.moduleCount - i - 1] = mod;
            } else if (i < 9) {
                this.modules[8][15 - i - 1 + 1] = mod;
            } else {
                this.modules[8][15 - i - 1] = mod;
            }
        }
        this.modules[this.moduleCount - 8][8] = !test;
    }

    private mapData(data: any[], maskPattern: number) {
        let inc = -1;
        let row = this.moduleCount - 1;
        let bitIndex = 7;
        let byteIndex = 0;
        for (let col = this.moduleCount - 1; col > 0; col -= 2) {
            if (col === 6) {
                col--;
            }
            while (!0) {
                for (let c = 0; c < 2; c++) {
                    if (this.modules[row][col - c] == null) {
                        let dark = !1;
                        if (byteIndex < data.length) {
                            dark = ((data[byteIndex] >>> bitIndex) & 1) === 1;
                        }
                        const mask = Util.hasMask(maskPattern, row, col - c);
                        if (mask) {
                            dark = !dark;
                        }
                        this.modules[row][col - c] = dark;
                        bitIndex--;
                        if (bitIndex === -1) {
                            byteIndex++;
                            bitIndex = 7;
                        }
                    }
                }
                row += inc;
                if (row < 0 || this.moduleCount <= row) {
                    row -= inc;
                    inc = -inc;
                    break;
                }
            }
        }
    }
}

export class Drawing {
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
    public canvas: Canvas;
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
        this.config = Drawing.generateDrawingConfig(config, moduleCount);
        this.isPainted = false;
        this.canvas = createCanvas(config.size, config.size, this.canvasType);
        this.context = this.canvas.getContext('2d');
    }

    public draw(): Promise<Canvas> {
        const mainCanvas = createCanvas(this.config.size, this.config.size, this.canvasType);
        const mainContext = mainCanvas.getContext('2d');

        let gradient: CanvasGradient | string;

        switch (this.config.gradientType) {
            case GradientType.NONE:
                gradient = this.config.colorDark;
                break;
            case GradientType.LINEAR:
                gradient = mainContext.createLinearGradient(0, 0, this.config.moduleSize * this.moduleCount, 0);
                gradient.addColorStop(0, this.config.colorDark);
                gradient.addColorStop(1, this.config.colorLight);
                break;
            case GradientType.HORIZONTAL:
                gradient = mainContext.createLinearGradient(0, 0, this.config.moduleSize * this.moduleCount, 0);
                gradient.addColorStop(0, this.config.colorDark);
                gradient.addColorStop(1, this.config.colorLight);
                break;
            case GradientType.VERTICAL:
                gradient = mainContext.createLinearGradient(0, 0, 0, this.config.moduleSize * this.moduleCount);
                gradient.addColorStop(0, this.config.colorDark);
                gradient.addColorStop(1, this.config.colorLight);
                break;
            case GradientType.RADIAL:
                gradient = mainContext.createRadialGradient(
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
                gradient = this.config.colorDark;
                break;
        }

        // Leave room for margin
        mainContext.translate(this.config.margin, this.config.margin);
        mainContext.save();

        const backgroundCanvas = createCanvas(this.config.size, this.config.size, this.canvasType);
        const backgroundContext = backgroundCanvas.getContext('2d');

        return this.addBackground(backgroundContext, this.config.size, this.config.backgroundImage, this.config.backgroundColor)
            .then(() => {
                return this.drawAlignPatterns(mainContext, gradient);
            })
            .then(() => {
                return this.drawPositionProtectors(mainContext);
            })
            .then(() => {
                return this.drawAlignProtectors(mainContext);
            })
            .then(() => {
                return this.drawPositionPatterns(mainContext, gradient);
            })
            .then(() => {
                return this.fillMargin(mainContext);
            })
            .then(() => {
                return this.drawLogoImage(mainContext);
            })
            .then(() => {
                // Swap and merge the foreground and the background
                const size = this.config.size;
                const margin = this.config.margin;
                backgroundContext.drawImage(mainCanvas, 0, 0, size, size);
                mainContext.drawImage(backgroundCanvas, -margin, -margin, size, size);
                return this.scaleFinalImage(mainCanvas);
            })
            .then((canvas: Canvas) => {
                return this.drawFrame(canvas, this.config.frameStyle, this.config.frameColor, this.config.frameText);
            })
            .then((canvas: Canvas) => {
                this.isPainted = true;
                return canvas;
            });
    }

    private async drawFrame(canvas: Canvas, frameStyle: QRCodeFrame | undefined, frameColor: string | undefined, frameText: string | undefined): Promise<Canvas> {
        if (!frameStyle || frameStyle === QRCodeFrame.NONE) {
            return canvas;
        }

        const color = frameColor ? frameColor : '#000000';
        const moduleSize = this.config.moduleSize;
        const rawSize = this.config.rawSize;
        const size = rawSize + moduleSize * 2;
        const text = frameText ? frameText.toUpperCase() : 'SCAN ME';
        let canvasWidth: number = size + moduleSize,
            canvasHeight: number = 1.265 * size,
            borderX: number = 0,
            borderY: number = 0,
            padX: number = 0,
            padY: number = 0,
            padHeight: number = 0,
            spaceX: number = 0,
            spaceY: number = 0,
            textX: number = 0,
            textY: number = 0,
            qrX: number = 0,
            qrY: number = 0,
            logoX: number = 0,
            logoY: number = 0,
            cornerRadius: number = 0;
        if (frameStyle === QRCodeFrame.BANNER_TOP || frameStyle === QRCodeFrame.BANNER_BOTTOM) {
            canvasHeight = 1.216 * size;
        }
        if (frameStyle === QRCodeFrame.BOX_TOP || frameStyle === QRCodeFrame.BOX_BOTTOM) {
            canvasHeight = 1.27 * size;
        }
        const finalCanvas: Canvas = createCanvas(canvasWidth, canvasHeight, this.canvasType);
        const finalContext = finalCanvas.getContext('2d');

        switch (frameStyle) {
            case QRCodeFrame.BOX_BOTTOM:
                cornerRadius = moduleSize;
                finalContext.lineJoin = 'round';
                finalContext.lineWidth = cornerRadius;
                borderX = cornerRadius / 2;
                borderY = cornerRadius / 2;
                padX = 0;
                padY = 1.05 * size + cornerRadius / 2;
                padHeight = size / 5;
                textX = size / 2 + moduleSize;
                textY = size * 1.17 + cornerRadius / 2 + moduleSize / 2;
                qrX = moduleSize + cornerRadius / 2;
                qrY = moduleSize + cornerRadius / 2;
                logoX = padX + size / 4.2;
                logoY = padY + cornerRadius * 1.45;
                finalContext.fillStyle = this.config.backgroundImage ? '#ffffff' : this.config.backgroundColor ? this.config.backgroundColor : '#ffffff';
                finalContext.fillRect(borderX + cornerRadius / 6, borderY + cornerRadius / 6, canvasWidth - 1.5 * cornerRadius, canvasWidth - 1.5 * cornerRadius);
                finalContext.fillStyle = color;
                finalContext.strokeStyle = color;
                this.drawSquareFrame(borderX, borderY, finalContext, size, size, false);
                cornerRadius = moduleSize;
                finalContext.lineWidth = cornerRadius;
                this.drawSquare(padX + cornerRadius / 1.5, padY + cornerRadius / 2, finalContext, size - cornerRadius + moduleSize / 1.5, padHeight - cornerRadius, true);
                cornerRadius = moduleSize;
                break;
            case QRCodeFrame.BOX_TOP:
                cornerRadius = moduleSize;
                finalContext.lineJoin = 'round';
                finalContext.lineWidth = cornerRadius;
                padX = 0;
                padY = 0;
                padHeight = size / 5;
                borderX = cornerRadius / 2;
                borderY = 1.2 * padHeight + cornerRadius / 2;
                textX = size / 2 + moduleSize;
                textY = size * 0.105 + cornerRadius / 2 + moduleSize / 2;
                qrX = borderX + moduleSize;
                qrY = borderY + moduleSize;
                logoX = padX + size / 4.2;
                logoY = padY + cornerRadius * 1.45;
                finalContext.fillStyle = this.config.backgroundImage ? '#ffffff' : this.config.backgroundColor ? this.config.backgroundColor : '#ffffff';
                finalContext.fillRect(borderX + cornerRadius / 6, borderY + cornerRadius / 6, canvasWidth - 1.5 * cornerRadius, canvasWidth - 1.5 * cornerRadius);
                finalContext.fillStyle = color;
                finalContext.strokeStyle = color;
                this.drawSquareFrame(borderX, borderY, finalContext, size, size, false);
                cornerRadius = moduleSize;
                finalContext.lineWidth = cornerRadius;
                this.drawSquare(padX + cornerRadius / 1.5, padY + cornerRadius / 2, finalContext, size - cornerRadius + moduleSize / 1.5, padHeight - cornerRadius, true);
                cornerRadius = moduleSize;
                break;
            case QRCodeFrame.BANNER_TOP:
                cornerRadius = moduleSize;
                finalContext.lineJoin = 'round';
                finalContext.lineWidth = cornerRadius;
                padX = 0;
                padY = 0;
                padHeight = size / 5;
                borderX = cornerRadius / 2;
                borderY = padHeight - 1;
                textX = size / 2 + moduleSize;
                textY = size * 0.113 + cornerRadius / 2 + moduleSize / 2;
                logoX = padX + size / 4.2;
                logoY = padY + cornerRadius * 1.8;
                qrX = borderX + moduleSize;
                qrY = borderY + moduleSize;
                finalContext.fillStyle = this.config.backgroundImage ? '#ffffff' : this.config.backgroundColor ? this.config.backgroundColor : '#ffffff';
                finalContext.fillRect(borderX + cornerRadius / 6, borderY + cornerRadius / 6, canvasWidth - 1.5 * cornerRadius, canvasWidth - 1.5 * cornerRadius);
                finalContext.fillStyle = color;
                finalContext.strokeStyle = color;
                this.drawSquareFrame(borderX, borderY, finalContext, size, size, false);
                this.drawSquare(padX + cornerRadius / 2, padY + cornerRadius / 2, finalContext, size, padHeight - cornerRadius, true);
                finalContext.moveTo(cornerRadius / 2, padHeight + cornerRadius * 2);
                finalContext.lineTo(cornerRadius / 2, padHeight / 2);

                finalContext.moveTo(size + cornerRadius / 2, padHeight + cornerRadius * 2);
                finalContext.lineTo(size + cornerRadius / 2, padHeight / 2);
                finalContext.stroke();
                break;
            case QRCodeFrame.BANNER_BOTTOM:
                cornerRadius = moduleSize;
                finalContext.lineJoin = 'round';
                finalContext.lineWidth = cornerRadius;
                borderX = cornerRadius / 2;
                borderY = cornerRadius / 2;
                padX = 0;
                padY = size + cornerRadius / 2;
                padHeight = size / 5;
                textX = size / 2 + moduleSize;
                textY = size * 1.11 + cornerRadius / 2 + moduleSize / 2;
                logoX = padX + size / 4.2;
                logoY = padY + cornerRadius * 1.2;
                qrX = moduleSize + cornerRadius / 2;
                qrY = moduleSize + cornerRadius / 2;
                finalContext.fillStyle = this.config.backgroundImage ? '#ffffff' : this.config.backgroundColor ? this.config.backgroundColor : '#ffffff';
                finalContext.fillRect(borderX + cornerRadius / 6, borderY + cornerRadius / 6, canvasWidth - 1.5 * cornerRadius, canvasWidth - 1.5 * cornerRadius);
                finalContext.fillStyle = color;
                finalContext.strokeStyle = color;
                this.drawSquareFrame(borderX, borderY, finalContext, size, size, false);
                this.drawSquare(padX + cornerRadius / 2, padY + cornerRadius / 2, finalContext, size, padHeight - cornerRadius, true);
                finalContext.moveTo(cornerRadius / 2, padY + cornerRadius / 2);
                finalContext.lineTo(cornerRadius / 2, size - cornerRadius);
                finalContext.lineTo(cornerRadius / 2, padY);
                finalContext.moveTo(size + cornerRadius / 2, padY + cornerRadius / 2);
                finalContext.lineTo(size + cornerRadius / 2, size - cornerRadius);
                finalContext.lineTo(size + cornerRadius / 2, padY + cornerRadius);
                finalContext.stroke();
                break;
            case QRCodeFrame.BALLOON_TOP:
                cornerRadius = moduleSize;
                finalContext.lineJoin = 'round';
                finalContext.lineWidth = cornerRadius;
                padX = 0;
                padY = 0;
                padHeight = size / 5;
                borderX = cornerRadius / 2;
                borderY = 0.05 * size + padHeight + cornerRadius / 2;
                textX = size / 2 + moduleSize;
                textY = size * 0.1 + cornerRadius / 2 + moduleSize / 2;
                logoX = padX + size / 4.2;
                logoY = padY + cornerRadius * 1.3;
                qrX = borderX + moduleSize;
                qrY = borderY + moduleSize;
                finalContext.fillStyle = this.config.backgroundImage ? '#ffffff' : this.config.backgroundColor ? this.config.backgroundColor : '#ffffff';
                finalContext.fillRect(0, padHeight / 2, canvasWidth, size + padHeight);
                finalContext.fillStyle = color;
                finalContext.strokeStyle = color;
                cornerRadius = moduleSize * 2;
                finalContext.lineWidth = cornerRadius;
                this.drawSquare(padX + cornerRadius / 2, padY + cornerRadius / 2, finalContext, size - cornerRadius + moduleSize, padHeight - cornerRadius, true);
                cornerRadius = moduleSize;
                break;
            case QRCodeFrame.BALLOON_BOTTOM:
                cornerRadius = moduleSize;
                finalContext.lineJoin = 'round';
                finalContext.lineWidth = cornerRadius;
                borderX = cornerRadius / 2;
                borderY = cornerRadius / 2;
                padX = 0;
                padY = 1.05 * size + cornerRadius / 2;
                padHeight = size / 5;
                textX = size / 2 + moduleSize;
                textY = size * 1.17 + cornerRadius / 2 + moduleSize / 2;
                logoX = padX + size / 4.2;
                logoY = padY + cornerRadius * 1.4;
                qrX = moduleSize + cornerRadius / 2;
                qrY = moduleSize + cornerRadius / 2;
                finalContext.fillStyle = this.config.backgroundImage ? '#ffffff' : this.config.backgroundColor ? this.config.backgroundColor : '#ffffff';
                finalContext.fillRect(0, 0, canvasWidth, padY + padHeight / 2);
                finalContext.fillStyle = color;
                finalContext.strokeStyle = color;
                cornerRadius = moduleSize * 2;
                finalContext.lineWidth = cornerRadius;
                this.drawSquare(padX + cornerRadius / 2, padY + cornerRadius / 2, finalContext, size - cornerRadius + moduleSize, padHeight - cornerRadius, true);
                cornerRadius = moduleSize;
                break;
            default:
                return canvas;
        }

        finalContext.fillStyle = '#ffffff';
        finalContext.strokeStyle = '#ffffff';

        finalContext.lineWidth = cornerRadius;
        finalContext.textAlign = 'center';
        const fontSize = this.config.size / 10;
        finalContext.font = `${fontSize}px "Roboto"`;

        textX = finalCanvas.width/2 + 1.1 * moduleSize;
        if (this.config.isVCard) {
            textX = textX + moduleSize * 3;
            textY = textY + moduleSize;
            logoX = logoX - moduleSize * 2;
            logoY = logoY + moduleSize * 2;
        }

        finalContext.fillText(text, textX, textY);
        finalContext.drawImage(canvas, qrX, qrY, rawSize, rawSize);
        return loadImage('https://static.beaconstac.com/assets/img/mobstac-awesome-qr/cellphone.svg').then(image => {

            if (this.config.isVCard) {
                logoX = (finalCanvas.width/2 - finalContext.measureText(text).width/2) - (this.config.size/13);
                logoY = logoY + (this.config.size * 0.01)
            } else {
                logoX = (finalCanvas.width/2 - finalContext.measureText(text).width/2) - (this.config.size/12);
            }
            finalContext.drawImage(image, logoX, logoY, size / 10, size / 10);
            finalContext.fillStyle = frameColor ? frameColor : '#000000';
            if (frameStyle === QRCodeFrame.BALLOON_BOTTOM) {
                if (!this.config.isVCard) {
                    finalContext.moveTo(padX + 5 + size / 2, padY + 2);
                    finalContext.lineTo(padX + 5 + size / 2 + moduleSize * 2, padY + 2);
                    finalContext.lineTo(padX + 5 + size / 2, padY + 2 - moduleSize * 2.5);
                    finalContext.lineTo(padX + 5 + size / 2 - moduleSize * 2, padY + 2);
                    finalContext.fill();
                } else {
                    finalContext.moveTo(padX + 5 + size / 2, padY + 2);
                    finalContext.lineTo(padX + 5 + size / 2 + moduleSize * 4, padY + 2);
                    finalContext.lineTo(padX + 5 + size / 2, padY + 2 - moduleSize * 4.5);
                    finalContext.lineTo(padX + 5 + size / 2 - moduleSize * 4, padY + 2);
                    finalContext.fill();
                }
            }
            if (frameStyle === QRCodeFrame.BALLOON_TOP) {
                if (!this.config.isVCard) {
                    finalContext.moveTo(padX + 5 + size / 2, padHeight - 2);
                    finalContext.lineTo(padX + 5 + size / 2 + moduleSize * 2, padHeight - 2);
                    finalContext.lineTo(padX + 5 + size / 2, padHeight - 2 + moduleSize * 2.5);
                    finalContext.lineTo(padX + 5 + size / 2 - moduleSize * 2, padHeight - 2);
                    finalContext.fill();
                } else {
                    finalContext.moveTo(padX + 5 + size / 2, padHeight - 2);
                    finalContext.lineTo(padX + 5 + size / 2 + moduleSize * 4, padHeight - 2);
                    finalContext.lineTo(padX + 5 + size / 2, padHeight - 2 + moduleSize * 4.5);
                    finalContext.lineTo(padX + 5 + size / 2 - moduleSize * 4, padHeight - 2);
                    finalContext.fill();
                }
            }
            return finalCanvas;
        }, err => {
            return finalCanvas;
        });
    }

    private async scaleFinalImage(canvas: Canvas): Promise<Canvas> {
        const rawSize = this.config.rawSize;

        const finalCanvas = createCanvas(rawSize, rawSize, this.canvasType);
        const finalContext = finalCanvas.getContext('2d');
        finalContext.drawImage(canvas, 0, 0, rawSize, rawSize);
        return finalCanvas;
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


    private async drawLogoImage(context: CanvasRenderingContext2D) {
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
        context.restore();

        const logoSize = this.config.viewportSize * logoScale;

        const mainMargin = this.config.margin;
        const coordinate = 0.5 * (this.config.size - logoSize);
        const centreCoordinate = coordinate - logoMargin - mainMargin;

        context.fillStyle = '#ffffff';
        context.save();
        CanvasUtil.prepareRoundedCornerClip(context, centreCoordinate, centreCoordinate, logoSize + 2 * logoMargin, logoSize + 2 * logoMargin, logoCornerRadius);
        context.clip();
        context.fill();
        context.restore();

        context.save();

        return loadImage(this.config.logoImage!, this.config.imageServerURL, this.config.imageServerRequestHeaders).then((image: any) => {
            CanvasUtil.prepareRoundedCornerClip(context, centreCoordinate + logoMargin, centreCoordinate + logoMargin, logoSize, logoSize, logoCornerRadius);
            context.clip();
            context.drawImage(image, centreCoordinate + logoMargin, centreCoordinate + logoMargin, logoSize, logoSize);
            context.restore();
        });
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

    private drawEyeFrames(context: CanvasRenderingContext2D, shape: EyeFrameShape, color: string | CanvasGradient) {
        const moduleSize = this.config.moduleSize;
        const moduleCount = this.moduleCount;
        switch (shape) {
            case EyeFrameShape.CIRCLE: {
                context.fillStyle = color;
                this.drawCircularFrame(3.5 * moduleSize, 3.5 * moduleSize, context);
                this.drawCircularFrame((moduleCount - 3.5) * moduleSize, 3.5 * moduleSize, context);
                this.drawCircularFrame(3.5 * moduleSize, (moduleCount - 3.5) * moduleSize, context);

                context.fillStyle = this.config.colorDark;
                break;
            }
            case EyeFrameShape.ROUNDED: {
                context.fillStyle = color;
                context.strokeStyle = color;
                const cornerRadius = moduleSize * 2;
                context.lineJoin = 'round';
                context.lineWidth = cornerRadius;

                this.drawSquareFrame(0 + cornerRadius / 4, 0 + cornerRadius / 4, context, 7 * moduleSize - cornerRadius / 2, 7 * moduleSize - cornerRadius / 2, true);
                this.drawSquareFrame((moduleCount - 7) * moduleSize + cornerRadius / 4, 0 + cornerRadius / 4, context, 7 * moduleSize - cornerRadius / 2, 7 * moduleSize - cornerRadius / 2, true);
                this.drawSquareFrame(0 + cornerRadius / 4, (moduleCount - 7) * moduleSize + cornerRadius / 4, context, 7 * moduleSize - cornerRadius / 2, 7 * moduleSize - cornerRadius / 2, true);
                context.fillStyle = this.config.colorDark;
                context.strokeStyle = this.config.colorDark;
                break;
            }
            case EyeFrameShape.LEFT_LEAF: {
                context.fillStyle = color;
                context.strokeStyle = color;
                const cornerRadius = moduleSize * 2;
                context.lineJoin = 'round';
                context.lineWidth = cornerRadius;

                this.drawLeafFrame(0 + cornerRadius / 4, 0 + cornerRadius / 4, context, 7 * moduleSize - cornerRadius / 2, 'left');
                this.drawLeafFrame((moduleCount - 7) * moduleSize + cornerRadius / 4, 0 + cornerRadius / 4, context, 7 * moduleSize - cornerRadius / 2, 'left');
                this.drawLeafFrame(0 + cornerRadius / 4, (moduleCount - 7) * moduleSize + cornerRadius / 4, context, 7 * moduleSize - cornerRadius / 2, 'left');
                context.fillStyle = this.config.colorDark;
                context.strokeStyle = this.config.colorDark;
                break;
            }
            case EyeFrameShape.RIGHT_LEAF: {
                context.fillStyle = color;
                context.strokeStyle = color;
                const cornerRadius = moduleSize * 2;
                context.lineJoin = 'round';
                context.lineWidth = cornerRadius;

                this.drawLeafFrame(0 + cornerRadius / 4, 0 + cornerRadius / 4, context, 7 * moduleSize - cornerRadius / 2, 'right');
                this.drawLeafFrame((moduleCount - 7) * moduleSize + cornerRadius / 4, 0 + cornerRadius / 4, context, 7 * moduleSize - cornerRadius / 2, 'right');
                this.drawLeafFrame(0 + cornerRadius / 4, (moduleCount - 7) * moduleSize + cornerRadius / 4, context, 7 * moduleSize - cornerRadius / 2, 'right');
                context.fillStyle = this.config.colorDark;
                context.strokeStyle = this.config.colorDark;
                break;
            }
            default: {
                context.fillStyle = color;
                this.drawSquareEyeFrame(0, 0, context, 7 * moduleSize, 7 * moduleSize, false);
                this.drawSquareEyeFrame((moduleCount - 7) * moduleSize, 0, context, 7 * moduleSize, 7 * moduleSize, false);
                this.drawSquareEyeFrame(0, (moduleCount - 7) * moduleSize, context, 7 * moduleSize, 7 * moduleSize, false);
                context.fillStyle = this.config.colorDark;
                break;
            }
        }
    }

    private drawLeafFrame(startX: number, startY: number, context: CanvasRenderingContext2D, dimension: number, direction: string) {
        const moduleSize = this.config.moduleSize;
        const r = startX + dimension;
        const b = startY + dimension;
        const radius = moduleSize * 2;
        context.beginPath();
        context.lineWidth = moduleSize;
        switch (direction) {
            case 'right': {
                context.moveTo(startX + radius, startY);
                context.lineTo(r, startY);
                context.lineTo(r, startY + dimension - radius);
                context.quadraticCurveTo(r, b, r - radius, b);
                context.lineTo(startX, b);
                context.lineTo(startX, startY + radius);
                context.quadraticCurveTo(startX, startY, startX + radius, startY);
                context.stroke();
                break;
            }
            case 'left': {
                context.moveTo(startX, startY);
                context.lineTo(r - radius, startY);
                context.quadraticCurveTo(r, startY, r, startY + radius);
                context.lineTo(r, startY + dimension);
                context.lineTo(startX + radius, b);
                context.quadraticCurveTo(startX, b, startX, b - radius);
                context.lineTo(startX, startY - radius / 4);
                context.stroke();
            }
        }
    }

    private drawSquareEyeFrame(startX: number, startY: number, context: CanvasRenderingContext2D, width: number, height: number, isRound: boolean) {
        const moduleSize = this.config.moduleSize;
        context.fillRect(startX, startY, width, height);
        context.clearRect(startX + 1 * moduleSize, startY + 1 * moduleSize, width - 2 * moduleSize, height - 2 * moduleSize);

    }

    private drawSquareFrame(startX: number, startY: number, context: CanvasRenderingContext2D, width: number, height: number, isRound: boolean) {
        const moduleSize = this.config.moduleSize;
        if (isRound) {
            const r = startX + width;
            const b = startY + height;
            const radius = moduleSize * 2;
            context.beginPath();
            context.lineWidth = moduleSize / 1.5;
            context.moveTo(startX + radius, startY);
            context.lineTo(r - radius, startY);
            context.quadraticCurveTo(r, startY, r, startY + radius);
            context.lineTo(r, startY + height - radius);
            context.quadraticCurveTo(r, b, r - radius, b);
            context.lineTo(startX + radius, b);
            context.quadraticCurveTo(startX, b, startX, b - radius);
            context.lineTo(startX, startY + radius);
            context.quadraticCurveTo(startX, startY, startX + radius, startY);
            context.stroke();
        } else {
            const r = startX + width;
            const b = startY + height;
            const radius = moduleSize / 2;
            context.beginPath();
            context.lineWidth = moduleSize / 1.5;
            context.moveTo(startX + radius, startY);
            context.lineTo(r - radius, startY);
            context.quadraticCurveTo(r, startY, r, startY + radius);
            context.lineTo(r, startY + height - radius);
            context.quadraticCurveTo(r, b, r - radius, b);
            context.lineTo(startX + radius, b);
            context.quadraticCurveTo(startX, b, startX, b - radius);
            context.lineTo(startX, startY + radius);
            context.quadraticCurveTo(startX, startY, startX + radius, startY);
            context.stroke();
        }
    }

    private drawCircularFrame(centerX: number, centerY: number, context: CanvasRenderingContext2D) {
        const moduleSize = this.config.moduleSize;
        context.beginPath();
        context.arc(centerX, centerY, moduleSize * 3.5, 0, Math.PI * 2, true);
        context.arc(centerX, centerY, moduleSize * 2.5, 0, Math.PI * 2, true);
        context.fill('evenodd');
    }

    private drawEyeBalls(context: CanvasRenderingContext2D, shape: EyeBallShape, color: string | CanvasGradient) {
        const moduleSize = this.config.moduleSize;
        const moduleCount = this.moduleCount;
        switch (shape) {
            case EyeBallShape.LEFT_DIAMOND: {
                context.fillStyle = color;
                this.drawDiamond(2 * moduleSize, 2 * moduleSize, context, 3 * moduleSize, 3 * moduleSize, false);
                this.drawDiamond((moduleCount - 7 + 2) * moduleSize, 2 * moduleSize, context, 3 * moduleSize, 3 * moduleSize, false);
                this.drawDiamond(2 * moduleSize, (moduleCount - 7 + 2) * moduleSize, context, 3 * moduleSize, 3 * moduleSize, false);
                context.fillStyle = this.config.colorDark;
                break;
            }
            case EyeBallShape.RIGHT_DIAMOND: {
                context.fillStyle = color;
                this.drawDiamond(2 * moduleSize, 2 * moduleSize, context, 3 * moduleSize, 3 * moduleSize, true);
                this.drawDiamond((moduleCount - 7 + 2) * moduleSize, 2 * moduleSize, context, 3 * moduleSize, 3 * moduleSize, true);
                this.drawDiamond(2 * moduleSize, (moduleCount - 7 + 2) * moduleSize, context, 3 * moduleSize, 3 * moduleSize, true);
                context.fillStyle = this.config.colorDark;
                break;
            }
            case EyeBallShape.CIRCLE: {
                context.fillStyle = color;
                this.drawCircle(3.5 * moduleSize, 3.5 * moduleSize, context, moduleSize * 1.5);
                this.drawCircle((moduleCount - 3.5) * moduleSize, 3.5 * moduleSize, context, moduleSize * 1.5);
                this.drawCircle(3.5 * moduleSize, (moduleCount - 3.5) * moduleSize, context, moduleSize * 1.5);
                context.fillStyle = this.config.colorDark;
                break;
            }
            case EyeBallShape.LEFT_LEAF: {
                context.fillStyle = color;
                this.drawDiamond(2 * moduleSize, 2 * moduleSize, context, 3 * moduleSize, 3 * moduleSize, false);
                this.drawDiamond((moduleCount - 7 + 2) * moduleSize, 2 * moduleSize, context, 3 * moduleSize, 3 * moduleSize, false);
                this.drawDiamond(2 * moduleSize, (moduleCount - 7 + 2) * moduleSize, context, 3 * moduleSize, 3 * moduleSize, false);
                this.drawCircle(3.5 * moduleSize, 3.5 * moduleSize, context, moduleSize * 1.5);
                this.drawCircle((moduleCount - 3.5) * moduleSize, 3.5 * moduleSize, context, moduleSize * 1.5);
                this.drawCircle(3.5 * moduleSize, (moduleCount - 3.5) * moduleSize, context, moduleSize * 1.5);
                context.fillStyle = this.config.colorDark;
                break;
            }
            case EyeBallShape.RIGHT_LEAF: {
                context.fillStyle = color;
                this.drawDiamond(2 * moduleSize, 2 * moduleSize, context, 3 * moduleSize, 3 * moduleSize, true);
                this.drawDiamond((moduleCount - 7 + 2) * moduleSize, 2 * moduleSize, context, 3 * moduleSize, 3 * moduleSize, true);
                this.drawDiamond(2 * moduleSize, (moduleCount - 7 + 2) * moduleSize, context, 3 * moduleSize, 3 * moduleSize, true);
                this.drawCircle(3.5 * moduleSize, 3.5 * moduleSize, context, moduleSize * 1.5);
                this.drawCircle((moduleCount - 3.5) * moduleSize, 3.5 * moduleSize, context, moduleSize * 1.5);
                this.drawCircle(3.5 * moduleSize, (moduleCount - 3.5) * moduleSize, context, moduleSize * 1.5);
                context.fillStyle = this.config.colorDark;
                break;
            }
            case EyeBallShape.ROUNDED: {
                context.fillStyle = color;
                context.strokeStyle = color;
                const cornerRadius = moduleSize * 2;
                context.lineJoin = 'round';
                context.lineWidth = cornerRadius;

                this.drawSquare(2 * moduleSize + cornerRadius / 2, 2 * moduleSize + cornerRadius / 2, context, 3 * moduleSize - cornerRadius, 3 * moduleSize - cornerRadius, true);
                this.drawSquare((moduleCount - 7 + 2) * moduleSize + cornerRadius / 2, 2 * moduleSize + cornerRadius / 2, context, 3 * moduleSize - cornerRadius, 3 * moduleSize - cornerRadius, true);
                this.drawSquare(2 * moduleSize + cornerRadius / 2, (moduleCount - 7 + 2) * moduleSize + cornerRadius / 2, context, 3 * moduleSize - cornerRadius, 3 * moduleSize - cornerRadius, true);
                context.fillStyle = this.config.colorDark;
                context.strokeStyle = this.config.colorDark;
                break;
            }
            default: {
                context.fillStyle = color;
                this.drawSquare(2 * moduleSize, 2 * moduleSize, context, 3 * moduleSize, 3 * moduleSize, false);
                this.drawSquare((moduleCount - 7 + 2) * moduleSize, 2 * moduleSize, context, 3 * moduleSize, 3 * moduleSize, false);
                this.drawSquare(2 * moduleSize, (moduleCount - 7 + 2) * moduleSize, context, 3 * moduleSize, 3 * moduleSize, false);
                context.fillStyle = this.config.colorDark;
                break;
            }
        }
    }

    private drawDiamond(startX: number, startY: number, context: CanvasRenderingContext2D, width: number, height: number, isRight?: boolean) {
        const moduleSize = width;

        if (isRight) {
            context.beginPath();
            context.moveTo(startX + width / 2, startY);
            context.lineTo(startX + width, startY);
            context.lineTo(startX + width, startY + height / 2);
            context.lineTo(startX + width / 2, startY + height);
            context.lineTo(startX, startY + height);
            context.lineTo(startX, startY + height / 2);
            context.fill();
        } else {
            context.beginPath();
            context.moveTo(startX, startY);
            context.lineTo(startX + width / 2, startY);
            context.lineTo(startX + width, startY + height / 2);
            context.lineTo(startX + width, startY + height);
            context.lineTo(startX + width / 2, startY + height);
            context.lineTo(startX, startY + height / 2);
            context.fill();
        }
    }

    private drawCircle(centerX: number, centerY: number, context: CanvasRenderingContext2D, radiusX: number, radiusY?: number, isLarge?: boolean) {
        context.beginPath();
        context.arc(centerX, centerY, radiusX, 0, Math.PI * 2, true);
        context.fill();
    }

    private drawSquare(startX: number, startY: number, context: CanvasRenderingContext2D, width: number, height: number, isRound: boolean) {
        if (isRound) {
            context.strokeRect(startX, startY, width, height);
        }
        context.fillRect(startX, startY, width, height);
    }

    private drawKite(startX: number, startY: number, context: CanvasRenderingContext2D, width: number, height: number, isRound?: boolean) {
        context.beginPath();
        context.moveTo(startX + width / 2, startY);
        context.lineTo(startX + width, startY + height / 2);
        context.lineTo(startX + width / 2, startY + height);
        context.lineTo(startX, startY + height / 2);
        context.fill();
    }

    private drawPositionPatterns(context: CanvasRenderingContext2D, gradient: CanvasGradient | string) {
        context.fillStyle = gradient;
        context.fillStyle = '#242'

        const moduleSize = this.config.moduleSize;
        const moduleCount = this.moduleCount;

        const eyeBallColor = this.config.eyeBallColor ? this.config.eyeBallColor : gradient;
        const eyeBallShape = this.config.eyeBallShape ? this.config.eyeBallShape : EyeBallShape.SQUARE;
        const eyeFrameColor = this.config.eyeFrameColor ? this.config.eyeFrameColor : gradient;
        const eyeFrameShape = this.config.eyeFrameShape ? this.config.eyeFrameShape : EyeFrameShape.SQUARE;
        const dataPattern = this.config.dataPattern ? this.config.dataPattern : DataPattern.SQUARE;

        this.drawEyeFrames(context, eyeFrameShape, eyeFrameColor);
        this.drawEyeBalls(context, eyeBallShape, eyeBallColor);

        context.fillStyle = gradient;
        for (let i = 0; i < moduleCount - 15; i += 2) {
            switch (dataPattern) {
                case DataPattern.CIRCLE:
                    this.drawCircle((8 + i) * moduleSize + moduleSize / 2, 6 * moduleSize + moduleSize / 2, context, moduleSize / 2);
                    this.drawCircle(6 * moduleSize + moduleSize / 2, (8 + i) * moduleSize + moduleSize / 2, context, moduleSize / 2);
                    break;
                case DataPattern.KITE:
                    this.drawKite((8 + i) * moduleSize, 6 * moduleSize, context, moduleSize, moduleSize);
                    this.drawKite(6 * moduleSize, (8 + i) * moduleSize, context, moduleSize, moduleSize);
                    break;
                case DataPattern.LEFT_DIAMOND:
                    this.drawDiamond((8 + i) * moduleSize, 6 * moduleSize, context, moduleSize, moduleSize, false);
                    this.drawDiamond(6 * moduleSize, (8 + i) * moduleSize, context, moduleSize, moduleSize, false);
                    break;
                case DataPattern.RIGHT_DIAMOND:
                    this.drawDiamond((8 + i) * moduleSize, 6 * moduleSize, context, moduleSize, moduleSize, true);
                    this.drawDiamond(6 * moduleSize, (8 + i) * moduleSize, context, moduleSize, moduleSize, true);
                    break;
                default:
                    this.drawSquare((8 + i) * moduleSize, 6 * moduleSize, context, moduleSize, moduleSize, false);
                    this.drawSquare(6 * moduleSize, (8 + i) * moduleSize, context, moduleSize, moduleSize, false);
                    break;
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
                    context.fillStyle = gradient;
                    this.drawAlign(context, agnX, agnY, moduleSize, moduleSize, dataPattern);
                } else {
                    context.fillStyle = gradient;
                    this.drawAlign(context, agnX, agnY, moduleSize, moduleSize, dataPattern);
                }
            }
        }
    }

    private drawAlign(context: CanvasRenderingContext2D, centerX: number, centerY: number, nWidth: number, nHeight: number, shape: DataPattern) {
        let drawShape;
        let boolFlag: boolean = false;
        switch (shape) {
            case DataPattern.CIRCLE:
                drawShape = this.drawCircle;
                break;
            case DataPattern.SQUARE:
                drawShape = this.drawSquare;
                break;
            case DataPattern.KITE:
                drawShape = this.drawKite;
                break;
            case DataPattern.LEFT_DIAMOND:
                drawShape = this.drawDiamond;
                break;
            case DataPattern.RIGHT_DIAMOND:
                drawShape = this.drawDiamond;
                boolFlag = true;
                break;
            default:
                drawShape = this.drawSquare;
                break;
        }
        let x = shape === DataPattern.CIRCLE ? (centerX - 2) * nWidth + nWidth / 2 : (centerX - 2) * nWidth;
        let y = shape === DataPattern.CIRCLE ? (centerY - 2) * nHeight + nHeight / 2 : (centerY - 2) * nHeight;
        let height = shape === DataPattern.CIRCLE ? nHeight / 2 : nHeight;
        let width = shape === DataPattern.CIRCLE ? nWidth / 2 : nWidth;
        for (let i = 0; i < 4; i++) {
            drawShape(x, y, context, width, height, boolFlag);
            y += nHeight;
        }

        x = shape === DataPattern.CIRCLE ? (centerX + 2) * nWidth + nWidth / 2 : (centerX + 2) * nWidth;
        y = shape === DataPattern.CIRCLE ? (centerY - 2 + 1) * nHeight + nHeight / 2 : (centerY - 2 + 1) * nHeight;
        for (let i = 0; i < 4; i++) {
            drawShape(x, y, context, width, height, boolFlag);
            y += nHeight;
        }

        x = shape === DataPattern.CIRCLE ? (centerX - 2 + 1) * nWidth + nWidth / 2 : (centerX - 2 + 1) * nWidth;
        y = shape === DataPattern.CIRCLE ? (centerY - 2) * nHeight + nHeight / 2 : (centerY - 2) * nHeight;
        for (let i = 0; i < 4; i++) {
            drawShape(x, y, context, width, height, boolFlag);
            x += nWidth;
        }

        x = shape === DataPattern.CIRCLE ? (centerX - 2) * nWidth + nWidth / 2 : (centerX - 2) * nWidth;
        y = shape === DataPattern.CIRCLE ? (centerY + 2) * nHeight + nHeight / 2 : (centerY + 2) * nHeight;
        for (let i = 0; i < 4; i++) {
            drawShape(x, y, context, width, height, boolFlag);
            x += nWidth;
        }

        x = shape === DataPattern.CIRCLE ? centerX * nWidth + nWidth / 2 : centerX * nWidth;
        y = shape === DataPattern.CIRCLE ? centerY * nHeight + nHeight / 2 : centerY * nHeight;
        drawShape(x, y, context, width, height, boolFlag);
    }

    private drawAlignProtectors(context: CanvasRenderingContext2D) {
        // context.fillStyle = '#242'
        const patternPosition = this.patternPosition;
        const moduleSize = this.config.moduleSize;
        const edgeCenter = patternPosition[patternPosition.length - 1];
        for (let i = 0; i < patternPosition.length; i++) {
            for (let j = 0; j < patternPosition.length; j++) {
                const agnX = patternPosition[j];
                const agnY = patternPosition[i];
                if (agnX === 6 && (agnY === 6 || agnY === edgeCenter)) {
                } else if (agnY === 6 && (agnX === 6 || agnX === edgeCenter)) {
                } else if (agnX !== 6 && agnX !== edgeCenter && agnY !== 6 && agnY !== edgeCenter) {
                    CanvasUtil.drawAlignProtector(context, agnX, agnY, moduleSize, moduleSize);
                } else {
                    CanvasUtil.drawAlignProtector(context, agnX, agnY, moduleSize, moduleSize);
                }
            }
        }
    }

    private drawPositionProtectors(context: CanvasRenderingContext2D) {
        // context.fillStyle = '#242';
        context.fillStyle = this.config.backgroundImage ? 'rgba(255, 255, 255, 0.6)' : this.config.backgroundColor ? this.config.backgroundColor : 'rgba(255, 255, 255, 0.6)';
        const size = this.config.moduleSize;
        const moduleCount = this.moduleCount;
        context.fillRect(0, 0, 8 * size, 8 * size);
        context.fillRect(0, (moduleCount - 8) * size, 8 * size, 8 * size);
        context.fillRect((moduleCount - 8) * size, 0, 8 * size, 8 * size);
        context.fillRect(8 * size, 6 * size, (moduleCount - 8 - 8) * size, size);
        context.fillRect(6 * size, 8 * size, size, (moduleCount - 8 - 8) * size);
    }

    private drawAlignPatterns(context: CanvasRenderingContext2D, gradient: CanvasGradient | string) {
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

                context.strokeStyle = bIsDark ? gradient : this.config.colorLight;
                context.lineWidth = 0.5;
                context.fillStyle = bIsDark ? gradient : this.config.backgroundImage ? 'rgba(255, 255, 255, 0.6)' : this.config.backgroundColor ? this.config.backgroundColor : 'rgba(255, 255, 255, 0.6)';

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

    private fillRectWithMask(canvas: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, bIsDark: boolean, shape: DataPattern) {
        if (!this.maskCanvas) {
            switch (shape) {
                case DataPattern.CIRCLE:
                    this.drawCircle(x + w / 2, y + h / 2, canvas, h / 2);
                    break;
                case DataPattern.KITE:
                    this.drawKite(x, y, canvas, w, h);
                    break;
                case DataPattern.LEFT_DIAMOND:
                    this.drawDiamond(x, y, canvas, w, h, false);
                    break;
                case DataPattern.RIGHT_DIAMOND:
                    this.drawDiamond(x, y, canvas, w, h, true);
                    break;
                default:
                    this.drawSquare(x, y, canvas, w, h, false);
                    break;
            }
        } else {
            canvas.drawImage(this.maskCanvas, x, y, w, h, x, y, w, h);
            const fill = canvas.fillStyle;
            canvas.fillStyle = bIsDark ? 'rgba(0, 0, 0, .5)' : 'rgba(255, 255, 255, .7)';
            canvas.fillRect(x, y, w, h);
            canvas.fillStyle = fill;
        }
    }

    private async addBackground(context: CanvasRenderingContext2D, size: number, backgroundImage?: string, backgroundColor?: string) {
        if (!backgroundImage) {
            context.rect(0, 0, size, size);
            context.fillStyle = backgroundColor ? backgroundColor : '#ffffff';
            context.fill();
            return;
        }

        return this.addBackgroundImage(context, size, backgroundImage!);
    }

    private async addBackgroundImage(context: CanvasRenderingContext2D, size: number, backgroundImage: string) {
        return loadImage(backgroundImage, this.config.imageServerURL, this.config.imageServerRequestHeaders).then(image => {
            if (this.config.autoColor) {
                // @ts-ignore
                const avgRGB = CanvasUtil.getAverageRGB(image, size);
                this.config.colorDark = 'rgb(' + avgRGB.r + ', ' + avgRGB.g + ', ' + avgRGB.b + ')';
            }

            if (this.config.maskedDots) {
                // tslint:disable-next-line
                const size = this.config.size;
                this.maskCanvas = createCanvas(size, size, this.canvasType);
                this.maskContext = this.maskCanvas.getContext('2d');

                // @ts-ignore
                this.maskContext.drawImage(image, 0, 0, image.width, image.height, 0, 0, size, size);

                this.maskContext.rect(0, 0, size, size);
                this.maskContext.fillStyle = '#ffffff';
                this.maskContext.fill();
            } else {
                // @ts-ignore
                context.drawImage(image, 0, 0, image.width, image.height, 0, 0, size, size);
                context.rect(0, 0, size, size);
                context.fillStyle = this.config.backgroundDimming;
                context.fill();
            }
        });
    }
}

export class QRRSBlock {
    public static RS_BLOCK_TABLE = [
        [1, 26, 19],
        [1, 26, 16],
        [1, 26, 13],
        [1, 26, 9],
        [1, 44, 34],
        [1, 44, 28],
        [1, 44, 22],
        [1, 44, 16],
        [1, 70, 55],
        [1, 70, 44],
        [2, 35, 17],
        [2, 35, 13],
        [1, 100, 80],
        [2, 50, 32],
        [2, 50, 24],
        [4, 25, 9],
        [1, 134, 108],
        [2, 67, 43],
        [2, 33, 15, 2, 34, 16],
        [2, 33, 11, 2, 34, 12],
        [2, 86, 68],
        [4, 43, 27],
        [4, 43, 19],
        [4, 43, 15],
        [2, 98, 78],
        [4, 49, 31],
        [2, 32, 14, 4, 33, 15],
        [4, 39, 13, 1, 40, 14],
        [2, 121, 97],
        [2, 60, 38, 2, 61, 39],
        [4, 40, 18, 2, 41, 19],
        [4, 40, 14, 2, 41, 15],
        [2, 146, 116],
        [3, 58, 36, 2, 59, 37],
        [4, 36, 16, 4, 37, 17],
        [4, 36, 12, 4, 37, 13],
        [2, 86, 68, 2, 87, 69],
        [4, 69, 43, 1, 70, 44],
        [6, 43, 19, 2, 44, 20],
        [6, 43, 15, 2, 44, 16],
        [4, 101, 81],
        [1, 80, 50, 4, 81, 51],
        [4, 50, 22, 4, 51, 23],
        [3, 36, 12, 8, 37, 13],
        [2, 116, 92, 2, 117, 93],
        [6, 58, 36, 2, 59, 37],
        [4, 46, 20, 6, 47, 21],
        [7, 42, 14, 4, 43, 15],
        [4, 133, 107],
        [8, 59, 37, 1, 60, 38],
        [8, 44, 20, 4, 45, 21],
        [12, 33, 11, 4, 34, 12],
        [3, 145, 115, 1, 146, 116],
        [4, 64, 40, 5, 65, 41],
        [11, 36, 16, 5, 37, 17],
        [11, 36, 12, 5, 37, 13],
        [5, 109, 87, 1, 110, 88],
        [5, 65, 41, 5, 66, 42],
        [5, 54, 24, 7, 55, 25],
        [11, 36, 12],
        [5, 122, 98, 1, 123, 99],
        [7, 73, 45, 3, 74, 46],
        [15, 43, 19, 2, 44, 20],
        [3, 45, 15, 13, 46, 16],
        [1, 135, 107, 5, 136, 108],
        [10, 74, 46, 1, 75, 47],
        [1, 50, 22, 15, 51, 23],
        [2, 42, 14, 17, 43, 15],
        [5, 150, 120, 1, 151, 121],
        [9, 69, 43, 4, 70, 44],
        [17, 50, 22, 1, 51, 23],
        [2, 42, 14, 19, 43, 15],
        [3, 141, 113, 4, 142, 114],
        [3, 70, 44, 11, 71, 45],
        [17, 47, 21, 4, 48, 22],
        [9, 39, 13, 16, 40, 14],
        [3, 135, 107, 5, 136, 108],
        [3, 67, 41, 13, 68, 42],
        [15, 54, 24, 5, 55, 25],
        [15, 43, 15, 10, 44, 16],
        [4, 144, 116, 4, 145, 117],
        [17, 68, 42],
        [17, 50, 22, 6, 51, 23],
        [19, 46, 16, 6, 47, 17],
        [2, 139, 111, 7, 140, 112],
        [17, 74, 46],
        [7, 54, 24, 16, 55, 25],
        [34, 37, 13],
        [4, 151, 121, 5, 152, 122],
        [4, 75, 47, 14, 76, 48],
        [11, 54, 24, 14, 55, 25],
        [16, 45, 15, 14, 46, 16],
        [6, 147, 117, 4, 148, 118],
        [6, 73, 45, 14, 74, 46],
        [11, 54, 24, 16, 55, 25],
        [30, 46, 16, 2, 47, 17],
        [8, 132, 106, 4, 133, 107],
        [8, 75, 47, 13, 76, 48],
        [7, 54, 24, 22, 55, 25],
        [22, 45, 15, 13, 46, 16],
        [10, 142, 114, 2, 143, 115],
        [19, 74, 46, 4, 75, 47],
        [28, 50, 22, 6, 51, 23],
        [33, 46, 16, 4, 47, 17],
        [8, 152, 122, 4, 153, 123],
        [22, 73, 45, 3, 74, 46],
        [8, 53, 23, 26, 54, 24],
        [12, 45, 15, 28, 46, 16],
        [3, 147, 117, 10, 148, 118],
        [3, 73, 45, 23, 74, 46],
        [4, 54, 24, 31, 55, 25],
        [11, 45, 15, 31, 46, 16],
        [7, 146, 116, 7, 147, 117],
        [21, 73, 45, 7, 74, 46],
        [1, 53, 23, 37, 54, 24],
        [19, 45, 15, 26, 46, 16],
        [5, 145, 115, 10, 146, 116],
        [19, 75, 47, 10, 76, 48],
        [15, 54, 24, 25, 55, 25],
        [23, 45, 15, 25, 46, 16],
        [13, 145, 115, 3, 146, 116],
        [2, 74, 46, 29, 75, 47],
        [42, 54, 24, 1, 55, 25],
        [23, 45, 15, 28, 46, 16],
        [17, 145, 115],
        [10, 74, 46, 23, 75, 47],
        [10, 54, 24, 35, 55, 25],
        [19, 45, 15, 35, 46, 16],
        [17, 145, 115, 1, 146, 116],
        [14, 74, 46, 21, 75, 47],
        [29, 54, 24, 19, 55, 25],
        [11, 45, 15, 46, 46, 16],
        [13, 145, 115, 6, 146, 116],
        [14, 74, 46, 23, 75, 47],
        [44, 54, 24, 7, 55, 25],
        [59, 46, 16, 1, 47, 17],
        [12, 151, 121, 7, 152, 122],
        [12, 75, 47, 26, 76, 48],
        [39, 54, 24, 14, 55, 25],
        [22, 45, 15, 41, 46, 16],
        [6, 151, 121, 14, 152, 122],
        [6, 75, 47, 34, 76, 48],
        [46, 54, 24, 10, 55, 25],
        [2, 45, 15, 64, 46, 16],
        [17, 152, 122, 4, 153, 123],
        [29, 74, 46, 14, 75, 47],
        [49, 54, 24, 10, 55, 25],
        [24, 45, 15, 46, 46, 16],
        [4, 152, 122, 18, 153, 123],
        [13, 74, 46, 32, 75, 47],
        [48, 54, 24, 14, 55, 25],
        [42, 45, 15, 32, 46, 16],
        [20, 147, 117, 4, 148, 118],
        [40, 75, 47, 7, 76, 48],
        [43, 54, 24, 22, 55, 25],
        [10, 45, 15, 67, 46, 16],
        [19, 148, 118, 6, 149, 119],
        [18, 75, 47, 31, 76, 48],
        [34, 54, 24, 34, 55, 25],
        [20, 45, 15, 61, 46, 16],
    ];

    public static getQRSBlocks(typeNumber: number, errorCorrectLevel: number) {
        const rsBlock = QRRSBlock.getQRSBlockTable(typeNumber, errorCorrectLevel);
        if (rsBlock === undefined) {
            throw new Error('bad rs block @ typeNumber:' + typeNumber + '/errorCorrectLevel:' + errorCorrectLevel);
        }
        const length = rsBlock.length / 3;
        const list = [];
        for (let i = 0; i < length; i++) {
            const count = rsBlock[i * 3];
            const totalCount = rsBlock[i * 3 + 1];
            const dataCount = rsBlock[i * 3 + 2];
            for (let j = 0; j < count; j++) {
                list.push(new QRRSBlock(totalCount, dataCount));
            }
        }
        return list;
    }

    public static getQRSBlockTable(typeNumber: number, errorCorrectLevel: number) {
        switch (errorCorrectLevel) {
            case QRErrorCorrectLevel.L:
                return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4];
            case QRErrorCorrectLevel.M:
                return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
            case QRErrorCorrectLevel.Q:
                return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
            case QRErrorCorrectLevel.H:
                return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
            default:
                return undefined;
        }
    }

    public totalCount: number;
    public dataCount: number;

    constructor(totalCount: number, dataCount: number) {
        this.totalCount = totalCount;
        this.dataCount = dataCount;
    }
}

export class QRBitBuffer {
    public buffer: any[] = [];
    public length = 0;

    public get(index: number) {
        const bufIndex = Math.floor(index / 8);
        return ((this.buffer[bufIndex] >>> (7 - (index % 8))) & 1) === 1;
    }

    public put(num: number, length: number) {
        for (let i = 0; i < length; i++) {
            this.putBit(((num >>> (length - i - 1)) & 1) === 1);
        }
    }

    public getLengthInBits() {
        return this.length;
    }

    public putBit(bit: any) {
        const bufIndex = Math.floor(this.length / 8);
        if (this.buffer.length <= bufIndex) {
            this.buffer.push(0);
        }
        if (bit) {
            this.buffer[bufIndex] |= 0x80 >>> this.length % 8;
        }
        this.length++;
    }
}

export class QR8bitByte {
    public data: string;
    public mode: QRMode = QRMode.MODE_8BIT_BYTE;
    public parsedData: any[] = [];

    constructor(data: string) {
        this.data = data;
        this.parse();
    }

    public getLength() {
        return this.parsedData.length;
    }

    public write(buffer: QRBitBuffer) {
        let i = 0;
        const l = this.parsedData.length;
        for (; i < l; i++) {
            buffer.put(this.parsedData[i], 8);
        }
    }

    private parse() {
        let i = 0;
        const l = this.data.length;
        for (; i < l; i++) {
            const byteArray = [];
            const code = this.data.charCodeAt(i);
            if (code > 0x10000) {
                byteArray[0] = 0xf0 | ((code & 0x1c0000) >>> 18);
                byteArray[1] = 0x80 | ((code & 0x3f000) >>> 12);
                byteArray[2] = 0x80 | ((code & 0xfc0) >>> 6);
                byteArray[3] = 0x80 | (code & 0x3f);
            } else if (code > 0x800) {
                byteArray[0] = 0xe0 | ((code & 0xf000) >>> 12);
                byteArray[1] = 0x80 | ((code & 0xfc0) >>> 6);
                byteArray[2] = 0x80 | (code & 0x3f);
            } else if (code > 0x80) {
                byteArray[0] = 0xc0 | ((code & 0x7c0) >>> 6);
                byteArray[1] = 0x80 | (code & 0x3f);
            } else {
                byteArray[0] = code;
            }
            this.parsedData.push(byteArray);
        }
        this.parsedData = Array.prototype.concat.apply([], this.parsedData);
        if (this.parsedData.length !== this.data.length) {
            this.parsedData.unshift(191);
            this.parsedData.unshift(187);
            this.parsedData.unshift(239);
        }
    }
}
