import {
    CanvasType,
    QRErrorCorrectLevel,
} from './Enums';
import { QRCode } from './Models';
import { QRCodeConfig } from './Types';
import { maxLogoScale } from './Common';

export class QRCodeBuilder {
    private config: QRCodeConfig;

    public constructor(config?: Partial<QRCodeConfig>) {
        const defaultConfig: QRCodeConfig = {
            size: 800,
            margin: 800/12, // margin must be 1/12 of size
            typeNumber: 4,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRErrorCorrectLevel.H,
            backgroundDimming: 'rgba(0,0,0,0)',
            logoScale: 0.15,
            logoMargin: 800/12/4, // 1/4 of margin
            logoCornerRadius: 8,
            rectangular: false,
            logoWidth: 0,
            logoHeight: 0,
            dotScale: 0.35,
            text: '',
            maskedDots: false,
            isVCard: false,
            useCanvas: false,
            useOpacity: true
        };
        this.config = Object.assign({}, defaultConfig, config);
    }

    public async build(format?: CanvasType): Promise<QRCode | never> {
        this.config.canvasType = format ? format : CanvasType.SVG;
        if (!this.config.text) {
            return Promise.reject('Setting text is necessary to generate the QRCode');
        }
        if (this.config.frameText && this.config.frameText.length > 30) {
            return Promise.reject('Frame text length exceeded');
        }
        if (this.config.logoScale > maxLogoScale) {
            this.config.logoScale = maxLogoScale ;
        }
        if (this.config.logoMargin > 100) {
            this.config.logoMargin = 50;
        }
        const qrCode: QRCode = new QRCode(-1, this.config);

        qrCode.svg = await qrCode.svgDrawing.drawSVG();
        return Promise.resolve(qrCode);

    }
}
