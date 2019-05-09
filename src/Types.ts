import {QRErrorCorrectLevel} from './Enums';

export type QRCodeConfig = {
    binarizeThreshold?: string;
    binarize?: boolean,
    size: number,
    margin: number,
    typeNumber: number,
    colorDark: string,
    colorLight: string,
    correctLevel: QRErrorCorrectLevel,
    backgroundImage?: string,
    backgroundDimming: string,
    logoImage?: string,
    logoScale: number,
    logoMargin: number,
    logoCornerRadius: number,
    whiteMargin?: boolean,
    dotScale: number,
    autoColor?: boolean,
    text: string,
    maskedDots: boolean,
    canvasType?: 'pdf' | 'svg'
    [key: string]: any;
}

export type QRDrawingConfig = {
    size: number,
    text: string,
    nSize: number,
    rawSize: number,
    viewportSize: number,
    margin: number,
    whiteMargin?: boolean,
    autoColor?: boolean,
    dotScale: number,
    moduleSize: number,
    backgroundDimming: string,
    backgroundImage?: string,
    colorDark: string,
    colorLight: string,
    logoImage?: string,
    logoScale: number,
    logoMargin: number,
    logoCornerRadius: number,
    maskedDots: boolean,
    canvasType?: 'pdf' | 'svg'
}