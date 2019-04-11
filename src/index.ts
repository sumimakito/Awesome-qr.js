import { QRErrorCorrectLevel } from './Enums';
import { Drawing, QRCode } from './Models';
import { QRCodeConfig } from './Types';
import { Canvas } from "canvas";


export class QRCodeGenerator {
    config: QRCodeConfig;
    qrCode: QRCode;
    drawing?: Drawing;

    constructor(config: Partial<QRCodeConfig>) {
        if (!config.text) {
            throw new Error('Text missing.')
        }
        const defaultConfig: QRCodeConfig = {
            size: 800,
            margin: 20,
            typeNumber: 4,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRErrorCorrectLevel.M,
            backgroundDimming: "rgba(0,0,0,0)",
            logoScale: 0.2,
            logoMargin: 6,
            logoCornerRadius: 8,
            dotScale: 0.35,
            text: '',
            maskedDots: false
        };
        this.config = Object.assign({}, defaultConfig, config);
        this.qrCode = new QRCode(-1, this.config.correctLevel);
    }

    create(): Promise<Canvas | never> {
        this.drawing = new Drawing(this.qrCode, this.config);
        return this.drawing.draw();
    }
}
