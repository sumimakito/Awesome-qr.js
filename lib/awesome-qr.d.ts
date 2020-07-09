/// <reference types="node" />
export declare type Options = {
    text: string;
    size?: number;
    margin?: number;
    typeNumber?: number;
    colorDark?: string;
    colorLight?: string;
    correctLevel?: number;
    backgroundImage?: string | Buffer;
    backgroundDimming?: string;
    gifBackground?: ArrayBuffer;
    logoImage?: string | Buffer;
    logoScale?: number;
    logoMargin?: number;
    logoCornerRadius?: number;
    whiteMargin?: boolean;
    dotScale?: number;
    autoColor?: boolean;
};
export declare class AwesomeQR {
    private canvas;
    private canvasContext;
    private qrCode?;
    private options;
    static CorrectLevel: {
        L: number;
        M: number;
        Q: number;
        H: number;
    };
    static _defaultOptions: Options;
    constructor(options: Options);
    draw(): Promise<Buffer | ArrayBuffer | undefined>;
    private _clear;
    private static _prepareRoundedCornerClip;
    private static _getAverageRGB;
    private static _drawAlignProtector;
    private static _drawAlign;
    private _draw;
}
