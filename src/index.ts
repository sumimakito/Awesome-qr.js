import {QRErrorCorrectLevel} from './Enums';
import {Drawing, QRCode} from './Models';
import {QRCodeConfig} from './Types';
import {Canvas} from "canvas";


export class QRCodeBuilder {
    config: QRCodeConfig;
    qrCode: QRCode;
    drawing?: Drawing;

    public constructor(config?: Partial<QRCodeConfig>) {
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

    public setSize(size: number) {
        this.config.size = size;
        return this;
    }

    public setMargin(margin: number) {
        this.config.margin = margin;
        return this;
    }

    public setTypeNumber(typeNumber: number) {
        this.config.typeNumber = typeNumber;
        return this;
    }

    public setColorDark(colorDark: string) {
        this.config.colorDark = colorDark;
        return this;
    }

    public setColorLight(colorLight: string) {
        this.config.colorLight = colorLight;
        return this;
    }

    public setCorrectLevel(correctLevel: QRErrorCorrectLevel) {
        this.config.correctLevel = correctLevel;
        return this;
    }

    public setBackgroundImage(backgroundImage: string) {
        this.config.backgroundImage = backgroundImage;
        return this;
    }

    public setBackgroundDimming(backgroundDimming: string) {
        this.config.backgroundDimming = backgroundDimming;
        return this;
    }

    public setLogoImage(logoImage: string) {
        this.config.logoImage = logoImage;
        return this;
    }

    public setLogoScale(logoScale: number) {
        this.config.logoScale = logoScale;
        return this;
    }

    public setLogoMargin(logoMargin: number) {
        this.config.logoMargin = logoMargin;
        return this;
    }

    public setLogoCornerRadius(logoCornerRadius: number) {
        this.config.logoCornerRadius = logoCornerRadius;
        return this;
    }

    public setWhiteMargin(whiteMargin: boolean) {
        this.config.whiteMargin = whiteMargin;
        return this;
    }

    public setDotScale(dotScale: number) {
        this.config.dotScale = dotScale;
        return this;
    }

    public setAutoColor(autoColor: boolean) {
        this.config.autoColor = autoColor;
        return this;
    }

    public setText(text: string) {
        this.config.text = text;
        return this;
    }

    public setMaskedDots(maskedDots: boolean) {
        this.config.maskedDots = maskedDots;
        return this;
    }

    public build(): Promise<Canvas | never> {
        if (!this.config.text) {
            return Promise.reject('Setting text is necessary to generate the QRCode');
        }
        this.drawing = new Drawing(this.qrCode, this.config);
        return this.drawing.draw();
    }
}
