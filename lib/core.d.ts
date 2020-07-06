export declare class QRCodeModel {
    typeNumber: number;
    errorCorrectLevel: QRErrorCorrectLevel;
    modules: (boolean | null)[][];
    dataCache: number[];
    dataList: QR8bitByte[];
    static PAD0: number;
    static PAD1: number;
    constructor(typeNumber: number, errorCorrectLevel: QRErrorCorrectLevel);
    get moduleCount(): number;
    addData(data: string): void;
    isDark(row: number, col: number): boolean;
    make(): void;
    makeImpl(test: boolean, maskPattern: QRMaskPattern): void;
    _setupPositionProbePattern(row: number, col: number): void;
    getBestMaskPattern(): QRMaskPattern;
    _setupTimingPattern(): void;
    _setupPositionAdjustPattern(): void;
    _setupTypeNumber(test: boolean): void;
    _setupTypeInfo(test: boolean, maskPattern: QRMaskPattern): void;
    _mapData(data: number[], maskPattern: QRMaskPattern): void;
    static _createData(typeNumber: number, errorCorrectLevel: QRErrorCorrectLevel, dataList: QR8bitByte[]): number[];
    static _createBytes(buffer: QRBitBuffer, rsBlocks: QRRSBlock[]): number[];
}
declare class QR8bitByte {
    data: string;
    mode: number;
    parsedData: number[];
    constructor(data: string);
    get length(): number;
    write(buffer: any): void;
}
export declare enum QRErrorCorrectLevel {
    L = 1,
    M = 0,
    Q = 3,
    H = 2
}
export declare enum QRMode {
    MODE_NUMBER = 1,
    MODE_ALPHA_NUM = 2,
    MODE_8BIT_BYTE = 4,
    MODE_KANJI = 8
}
export declare enum QRMaskPattern {
    PATTERN000 = 0,
    PATTERN001 = 1,
    PATTERN010 = 2,
    PATTERN011 = 3,
    PATTERN100 = 4,
    PATTERN101 = 5,
    PATTERN110 = 6,
    PATTERN111 = 7
}
export declare class QRUtil {
    static LIMIT_LENGTH: number[][];
    static PATTERN_POSITION_TABLE: number[][];
    static G15: number;
    static G18: number;
    static G15_MASK: number;
    static getUTF8Length(text: string): number;
    static getTypeNumber(text: string, nCorrectLevel: QRErrorCorrectLevel): number;
    static getBCHTypeInfo(data: number): number;
    static getBCHTypeNumber(data: number): number;
    static getBCHDigit(data: number): number;
    static getPatternPosition(typeNumber: number): number[];
    static getMask(maskPattern: QRMaskPattern, i: number, j: number): boolean;
    static getErrorCorrectPolynomial(errorCorrectLength: QRErrorCorrectLevel): QRPolynomial;
    static getLengthInBits(mode: QRMode, type: number): 8 | 10 | 9 | 12 | 11 | 16 | 14 | 13;
    static getLostPoint(qrCode: QRCodeModel): number;
}
declare class QRPolynomial {
    num: number[];
    constructor(num: number[], shift: number);
    get(index: number): number;
    get length(): number;
    multiply(e: QRPolynomial): QRPolynomial;
    mod(e: QRPolynomial): QRPolynomial;
}
declare class QRRSBlock {
    totalCount: number;
    dataCount: number;
    constructor(totalCount: number, dataCount: number);
    static RS_BLOCK_TABLE: number[][];
    static getRSBlocks(typeNumber: number, errorCorrectLevel: QRErrorCorrectLevel): QRRSBlock[];
    static getRsBlockTable(typeNumber: number, errorCorrectLevel: QRErrorCorrectLevel): number[] | undefined;
}
declare class QRBitBuffer {
    buffer: number[];
    length: number;
    get(index: number): boolean;
    put(num: number, length: number): void;
    putBit(bit: boolean): void;
}
export {};
