import { Canvas, CanvasRenderingContext2D, createCanvas, JPEGStream, PDFStream, PNGStream } from 'canvas';
import { BCH, CanvasUtil, QRMath, Util } from './Common';
import * as constants from './Constants';
import { CanvasType, QRErrorCorrectLevel, QRMode } from './Enums';
import { QRCodeConfig, QRDrawingConfig } from './Types';
import { loadImage } from './Util';

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
    public static PAD0 = 0xEC;
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
                ecdata[r][i] = (modIndex >= 0) ? modPoly.get(modIndex) : 0;
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
    // @ts-ignore
    public canvas: Canvas;

    private config: QRCodeConfig;

    constructor(typeNumber: number, config: QRCodeConfig) {
        this.typeNumber = typeNumber;
        this.config = config;
        this.errorCorrectLevel = config.correctLevel;
        this.addData(config.text);
        this.make();
        this.drawing = new Drawing(this.moduleCount, this.patternPosition, config, this.isDark, this.modules);
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
                if ((0 <= r && r <= 6 && (c === 0 || c === 6)) || (0 <= c && c <= 6 && (r === 0 || r === 6)) ||
                    (2 <= r && r <= 4 && 2 <= c && c <= 4)) {
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
            this.modules[r][6] = (r % 2 === 0);
        }
        for (let c = 8; c < this.moduleCount - 8; c++) {
            if (this.modules[6][c] != null) {
                continue;
            }
            this.modules[6][c] = (c % 2 === 0);
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
            mod = (!test && ((bits >> i) & 1) === 1);
            this.modules[Math.floor(i / 3)][i % 3 + this.moduleCount - 8 - 3] = mod;
        }
        for (i = 0; i < 18; i++) {
            mod = (!test && ((bits >> i) & 1) === 1);
            this.modules[i % 3 + this.moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
        }
    }

    private setupTypeInfo(test: boolean, maskPattern: number) {
        let i;
        let mod;
        const data = (this.errorCorrectLevel << 3) | maskPattern;
        const bits = BCH.typeInfo(data);
        for (i = 0; i < 15; i++) {
            mod = (!test && ((bits >> i) & 1) === 1);
            if (i < 6) {
                this.modules[i][8] = mod;
            } else if (i < 8) {
                this.modules[i + 1][8] = mod;
            } else {
                this.modules[this.moduleCount - 15 + i][8] = mod;
            }
        }
        for (i = 0; i < 15; i++) {
            mod = (!test && ((bits >> i) & 1) === 1);
            if (i < 8) {
                this.modules[8][this.moduleCount - i - 1] = mod;
            } else if (i < 9) {
                this.modules[8][15 - i - 1 + 1] = mod;
            } else {
                this.modules[8][15 - i - 1] = mod;
            }
        }
        this.modules[this.moduleCount - 8][8] = (!test);
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
                            dark = (((data[byteIndex] >>> bitIndex) & 1) === 1);
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

        // Leave room for margin
        mainContext.translate(this.config.margin, this.config.margin);
        mainContext.save();

        const backgroundCanvas = createCanvas(this.config.size, this.config.size, this.canvasType);
        const backgroundContext = backgroundCanvas.getContext('2d');

        return this.addBackground(backgroundContext, this.config.size, this.config.backgroundImage).then(() => {
            return this.drawAlignPatterns(mainContext);
        }).then(() => {
            return this.drawPositionProtectors(mainContext);
        }).then(() => {
            return this.drawAlignProtectors(mainContext);
        }).then(() => {
            return this.drawPositionPatterns(mainContext);
        }).then(() => {
            return this.fillMargin(mainContext);
        }).then(() => {
            return this.drawLogoImage(mainContext);
        }).then(() => {
            // Swap and merge the foreground and the background
            const size = this.config.size;
            const margin = this.config.margin;
            backgroundContext.drawImage(mainCanvas, 0, 0, size, size);
            mainContext.drawImage(backgroundCanvas, -margin, -margin, size, size);
            return this.scaleFinalImage(mainCanvas);
        }).then((canvas: Canvas) => {
            this.isPainted = true;
            return canvas;
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

        return loadImage(this.config.logoImage!).then(image => {
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
            context.fillStyle = '#FFFFFF';
            context.fillRect(-margin, -margin, size, margin);
            context.fillRect(-margin, viewportSize, size, margin);
            context.fillRect(viewportSize, -margin, margin, size);
            context.fillRect(-margin, -margin, margin, size);
        }
    }

    private drawPositionPatterns(context: CanvasRenderingContext2D) {
        context.fillStyle = this.config.colorDark;

        const moduleSize = this.config.moduleSize;
        const moduleCount = this.moduleCount;
        context.fillRect(0, 0, 7 * moduleSize, moduleSize);
        context.fillRect((moduleCount - 7) * moduleSize, 0, 7 * moduleSize, moduleSize);
        context.fillRect(0, 6 * moduleSize, 7 * moduleSize, moduleSize);
        context.fillRect((moduleCount - 7) * moduleSize, 6 * moduleSize, 7 * moduleSize, moduleSize);
        context.fillRect(0, (moduleCount - 7) * moduleSize, 7 * moduleSize, moduleSize);
        context.fillRect(0, (moduleCount - 7 + 6) * moduleSize, 7 * moduleSize, moduleSize);
        context.fillRect(0, 0, moduleSize, 7 * moduleSize);
        context.fillRect(6 * moduleSize, 0, moduleSize, 7 * moduleSize);
        context.fillRect((moduleCount - 7) * moduleSize, 0, moduleSize, 7 * moduleSize);
        context.fillRect((moduleCount - 7 + 6) * moduleSize, 0, moduleSize, 7 * moduleSize);
        context.fillRect(0, (moduleCount - 7) * moduleSize, moduleSize, 7 * moduleSize);
        context.fillRect(6 * moduleSize, (moduleCount - 7) * moduleSize, moduleSize, 7 * moduleSize);

        context.fillRect(2 * moduleSize, 2 * moduleSize, 3 * moduleSize, 3 * moduleSize);
        context.fillRect((moduleCount - 7 + 2) * moduleSize, 2 * moduleSize, 3 * moduleSize, 3 * moduleSize);
        context.fillRect(2 * moduleSize, (moduleCount - 7 + 2) * moduleSize, 3 * moduleSize, 3 * moduleSize);

        for (let i = 0; i < moduleCount - 8; i += 2) {
            context.fillRect((8 + i) * moduleSize, 6 * moduleSize, moduleSize, moduleSize);
            context.fillRect(6 * moduleSize, (8 + i) * moduleSize, moduleSize, moduleSize);
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
                    context.fillStyle = 'rgba(0, 0, 0, .2)';
                    CanvasUtil.drawAlign(context, agnX, agnY, moduleSize, moduleSize);
                } else {
                    context.fillStyle = this.config.colorDark;
                    CanvasUtil.drawAlign(context, agnX, agnY, moduleSize, moduleSize);
                }
            }
        }
    }

    private drawAlignProtectors(context: CanvasRenderingContext2D) {
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
        context.fillStyle = 'rgba(255, 255, 255, 0.6)';
        const size = this.config.moduleSize;
        const moduleCount = this.moduleCount;
        context.fillRect(0, 0, 8 * size, 8 * size);
        context.fillRect(0, (moduleCount - 8) * size, 8 * size, 8 * size);
        context.fillRect((moduleCount - 8) * size, 0, 8 * size, 8 * size);
        context.fillRect(8 * size, 6 * size, (moduleCount - 8 - 8) * size, size);
        context.fillRect(6 * size, 8 * size, size, (moduleCount - 8 - 8) * size);
    }

    private drawAlignPatterns(context: CanvasRenderingContext2D) {
        const moduleCount = this.moduleCount;
        const xyOffset = (1 - this.config.dotScale) * 0.5;

        for (let row = 0; row < moduleCount; row++) {
            for (let col = 0; col < moduleCount; col++) {
                const bIsDark = this.isDark.bind(this)(row, col) || false;

                const isBlkPosCtr = ((col < 8 && (row < 8 || row >= moduleCount - 8)) || (col >= moduleCount - 8 && row < 8));
                let bProtected = (row === 6 || col === 6 || isBlkPosCtr);

                const patternPosition = this.patternPosition;
                for (let i = 0; i < patternPosition.length - 1; i++) {
                    bProtected = bProtected || (row >= patternPosition[i] - 2 && row <= patternPosition[i] + 2 &&
                        col >= patternPosition[i] - 2 && col <= patternPosition[i] + 2);
                }

                context.strokeStyle = bIsDark ? this.config.colorDark : this.config.colorLight;
                context.lineWidth = 0.5;
                context.fillStyle = bIsDark ? this.config.colorDark : 'rgba(255, 255, 255, 0.6)';

                const nLeft = col * this.config.nSize + (bProtected ? 0 : (xyOffset * this.config.nSize));
                const nTop = row * this.config.nSize + (bProtected ? 0 : (xyOffset * this.config.nSize));
                if (patternPosition.length === 0) {
                    // if align pattern list is empty, then it means that we don't need to leave room for the align patterns
                    if (!bProtected) {
                        this.fillRectWithMask(context, nLeft, nTop, (bProtected ? (isBlkPosCtr ? 1 : 1) : this.config.dotScale) * this.config.nSize, (bProtected ? (isBlkPosCtr ? 1 : 1) : this.config.dotScale) * this.config.nSize, bIsDark);
                    }
                } else {
                    const inAgnRange = ((col < moduleCount - 4 && col >= moduleCount - 4 - 5 && row < moduleCount - 4 && row >= moduleCount - 4 - 5));
                    if (!bProtected && !inAgnRange) {
                        this.fillRectWithMask(context, nLeft, nTop, (bProtected ? (isBlkPosCtr ? 1 : 1) : this.config.dotScale) * this.config.nSize, (bProtected ? (isBlkPosCtr ? 1 : 1) : this.config.dotScale) * this.config.nSize, bIsDark);
                    }
                }
            }
        }
    }

    private fillRectWithMask(canvas: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, bIsDark: boolean) {
        if (!this.maskCanvas) {
            canvas.fillRect(x, y, w, h);
        } else {
            canvas.drawImage(this.maskCanvas, x, y, w, h, x, y, w, h);
            const fill = canvas.fillStyle;
            canvas.fillStyle = bIsDark ? 'rgba(0, 0, 0, .5)' : 'rgba(255, 255, 255, .7)';
            canvas.fillRect(x, y, w, h);
            canvas.fillStyle = fill;
        }
    }

    private async addBackground(context: CanvasRenderingContext2D, size: number, backgroundImage?: string) {
        if (!backgroundImage) {
            context.rect(0, 0, size, size);
            context.fillStyle = '#ffffff';
            context.fill();
            return;
        }

        return this.addBackgroundImage(context, size, backgroundImage!);
    }

    private async addBackgroundImage(context: CanvasRenderingContext2D, size: number, backgroundImage: string) {
        return loadImage(backgroundImage).then(image => {
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
        return ((this.buffer[bufIndex] >>> (7 - index % 8)) & 1) === 1;
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
            this.buffer[bufIndex] |= (0x80 >>> (this.length % 8));
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
                byteArray[0] = 0xF0 | ((code & 0x1C0000) >>> 18);
                byteArray[1] = 0x80 | ((code & 0x3F000) >>> 12);
                byteArray[2] = 0x80 | ((code & 0xFC0) >>> 6);
                byteArray[3] = 0x80 | (code & 0x3F);
            } else if (code > 0x800) {
                byteArray[0] = 0xE0 | ((code & 0xF000) >>> 12);
                byteArray[1] = 0x80 | ((code & 0xFC0) >>> 6);
                byteArray[2] = 0x80 | (code & 0x3F);
            } else if (code > 0x80) {
                byteArray[0] = 0xC0 | ((code & 0x7C0) >>> 6);
                byteArray[1] = 0x80 | (code & 0x3F);
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
