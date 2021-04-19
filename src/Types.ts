import { CanvasType, DataPattern, EyeBallShape, EyeFrameShape, GradientType, QRCodeFrame, QRErrorCorrectLevel } from './Enums';

export interface QRCodeConfig {
    binarizeThreshold?: string;
    binarize?: boolean;
    size: number;
    margin: number;
    typeNumber: number;
    colorDark: string;
    colorLight: string;
    correctLevel: QRErrorCorrectLevel;
    backgroundImage?: string;
    backgroundDimming: string;
    logoImage?: string;
    logoScale: number;
    logoMargin: number;
    logoCornerRadius: number;
    whiteMargin?: boolean;
    dotScale: number;
    autoColor?: boolean;
    text: string;
    maskedDots: boolean;
    canvasType?: CanvasType;
    eyeBallShape?: EyeBallShape;
    eyeFrameShape?: EyeFrameShape;
    eyeBallColor?: string;
    eyeFrameColor?: string;
    dataPattern?: DataPattern;
    gradientType?: GradientType;
    backgroundColor?: string;
    frameStyle?: QRCodeFrame;
    frameColor?: string;
    frameText?: string;
    isVCard?: boolean;
    imageServerURL?: string,
    imageServerRequestHeaders?: object

    [key: string]: any;
}

export interface QRDrawingConfig {
    size: number;
    text: string;
    nSize: number;
    rawSize: number;
    viewportSize: number;
    margin: number;
    whiteMargin?: boolean;
    autoColor?: boolean;
    dotScale: number;
    moduleSize: number;
    backgroundDimming: string;
    backgroundImage?: string;
    colorDark: string;
    colorLight: string;
    logoImage?: string;
    logoScale: number;
    logoMargin: number;
    logoCornerRadius: number;
    maskedDots: boolean;
    designStyle?:string;
    designBorder?: boolean;
    canvasType?: CanvasType;
    eyeBallShape?: EyeBallShape;
    eyeFrameShape?: EyeFrameShape;
    eyeBallColor?: string;
    eyeFrameColor?: string;
    dataPattern?: DataPattern;
    gradientType?: GradientType;
    backgroundColor?: string;
    frameStyle?: QRCodeFrame;
    frameColor?: string;
    frameText?: string;
    isVCard?: boolean;
    imageServerURL?: string,
    imageServerRequestHeaders?: object
}
