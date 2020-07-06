/// <reference types="node" />
import { QRErrorCorrectLevel } from "./core";
declare namespace AwesomeQR {
    type Options = {
        text: string;
        size?: number;
        margin?: number;
        typeNumber?: number;
        colorDark?: string;
        colorLight?: string;
        correctLevel?: QRErrorCorrectLevel;
        backgroundImage?: string | HTMLImageElement;
        backgroundDimming?: string;
        gifBackground?: ArrayBuffer;
        logoImage?: string | HTMLImageElement;
        logoScale?: number;
        logoMargin?: number;
        logoCornerRadius?: number;
        whiteMargin?: boolean;
        dotScale?: number;
        autoColor?: boolean;
    };
}
export default class AwesomeQR {
    private canvas;
    private canvasContext;
    private qrCode?;
    private options;
    static CorrectLevel: typeof QRErrorCorrectLevel;
    static _defaultOptions: AwesomeQR.Options;
    constructor(options: AwesomeQR.Options);
    draw(): Promise<Buffer | ArrayBuffer | undefined>;
    private _clear;
    private static _prepareRoundedCornerClip;
    private static _getAverageRGB;
    private static _drawAlignProtector;
    private static _drawAlign;
    private _draw;
}
export {};
