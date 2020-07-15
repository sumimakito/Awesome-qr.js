export = GIFEncoder;
declare function GIFEncoder(width: any, height: any): void;
declare class GIFEncoder {
    constructor(width: any, height: any);
    width: number;
    height: number;
    transparent: any;
    transIndex: number;
    repeat: number;
    delay: number;
    image: any;
    pixels: Uint8Array | null;
    indexedPixels: Uint8Array | null;
    colorDepth: number | null;
    colorTab: any;
    neuQuant: import("./TypedNeuQuant.js") | null;
    usedEntry: any[];
    palSize: number;
    dispose: number;
    firstFrame: boolean;
    sample: number;
    dither: boolean;
    globalPalette: any;
    out: ByteArray;
    setDelay(milliseconds: any): void;
    setFrameRate(fps: any): void;
    setDispose(disposalCode: any): void;
    setRepeat(repeat: any): void;
    setTransparent(color: any): void;
    addFrame(imageData: any): void;
    finish(): void;
    setQuality(quality: any): void;
    setDither(dither: any): void;
    setGlobalPalette(palette: any): void;
    getGlobalPalette(): any;
    writeHeader(): void;
    analyzePixels(): void;
    indexPixels(imgq: any): void;
    ditherPixels(kernel: any, serpentine: any): void;
    findClosest(c: any, used: any): number;
    findClosestRGB(r: any, g: any, b: any, used: any): number;
    getImagePixels(): void;
    writeGraphicCtrlExt(): void;
    writeImageDesc(): void;
    writeLSD(): void;
    writeNetscapeExt(): void;
    writePalette(): void;
    writeShort(pValue: any): void;
    writePixels(): void;
    stream(): ByteArray;
}
declare function ByteArray(): void;
declare class ByteArray {
    page: number;
    pages: any[];
    newPage(): void;
    cursor: number | undefined;
    getData(): string;
    toFlattenUint8Array(): Uint8Array;
    writeByte(val: any): void;
    writeUTFBytes(string: any): void;
    writeBytes(array: any, offset: any, length: any): void;
}
declare namespace ByteArray {
    export const pageSize: number;
    export const charMap: {};
}
