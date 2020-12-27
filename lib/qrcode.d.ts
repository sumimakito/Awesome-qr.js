declare class QR8bitByte {
    mode: number;
    data: string;
    parsedData: number[];
    constructor(data: string);
    getLength(): number;
    write(buffer: QRBitBuffer): void;
}
export declare class QRCodeModel {
    typeNumber: number;
    errorCorrectLevel: number;
    modules?: (boolean | null)[][];
    moduleCount: number;
    dataCache?: number[];
    dataList: QR8bitByte[];
    constructor(typeNumber?: number, errorCorrectLevel?: number);
    addData(data: string): void;
    isDark(row: number, col: number): boolean | null;
    getModuleCount(): number;
    make(): void;
    makeImpl(test: boolean, maskPattern: number): void;
    setupPositionProbePattern(row: number, col: number): void;
    getBestMaskPattern(): number;
    setupTimingPattern(): void;
    setupPositionAdjustPattern(): void;
    setupTypeNumber(test: boolean): void;
    setupTypeInfo(test: boolean, maskPattern: number): void;
    mapData(data: number[], maskPattern: number): void;
    static PAD0: number;
    static PAD1: number;
    static createData(typeNumber: number, errorCorrectLevel: number, dataList: QR8bitByte[]): number[];
    static createBytes(buffer: QRBitBuffer, rsBlocks: QRRSBlock[]): number[];
}
export declare const QRErrorCorrectLevel: {
    L: number;
    M: number;
    Q: number;
    H: number;
};
export declare class QRUtil {
    static PATTERN_POSITION_TABLE: number[][];
    static G15: number;
    static G18: number;
    static G15_MASK: number;
    static getBCHTypeInfo(data: number): number;
    static getBCHTypeNumber(data: number): number;
    static getBCHDigit(data: number): number;
    static getPatternPosition(typeNumber: number): number[];
    static getMask(maskPattern: number, i: number, j: number): boolean;
    static getErrorCorrectPolynomial(errorCorrectLength: number): QRPolynomial;
    static getLengthInBits(mode: number, type: number): 8 | 14 | 11 | 12 | 10 | 9 | 16 | 13;
    static getLostPoint(qrCode: QRCodeModel): number;
}
export declare class QRMath {
    static glog(n: number): any;
    static gexp(n: number): any;
    static EXP_TABLE: any[];
    static LOG_TABLE: any[];
    static _constructor: void;
}
declare class QRPolynomial {
    num: number[];
    constructor(num: number[], shift: number);
    get(index: number): number;
    getLength(): number;
    multiply(e: QRPolynomial): QRPolynomial;
    mod(e: QRPolynomial): QRPolynomial;
}
declare class QRRSBlock {
    totalCount: number;
    dataCount: number;
    constructor(totalCount: number, dataCount: number);
    static RS_BLOCK_TABLE: number[][];
    static getRSBlocks(typeNumber: number, errorCorrectLevel: number): QRRSBlock[];
    static getRsBlockTable(typeNumber: number, errorCorrectLevel: number): number[] | undefined;
}
declare class QRBitBuffer {
    buffer: number[];
    length: number;
    constructor();
    get(index: number): boolean;
    put(num: number, length: number): void;
    getLengthInBits(): number;
    putBit(bit: boolean): void;
}
export {};
