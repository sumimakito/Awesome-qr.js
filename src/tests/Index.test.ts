import 'mocha';
import { CanvasType, EyeBallShape, EyeFrameShape, DataPattern, GradientType, QRCodeFrame } from '../Enums';
import { QRCodeBuilder } from '../index';

describe('QR code tests', () => {
    it('Main test', done => {
        const qrCodeGenerator = new QRCodeBuilder({
            text: 'http://www.beaconstac.com/',
            backgroundImage: 'https://image.flaticon.com/teams/slug/google.jpg',
            backgroundColor: '#f7f7c3',
            logoImage: 'https://static.beaconstac.com/assets/img/qr-code-logos/app-store.svg',
            canvasType: CanvasType.SVG,
            eyeFrameShape: EyeFrameShape.ROUNDED,
            eyeBallShape: EyeBallShape.LEFT_LEAF,
            eyeFrameColor: '#287314',
            eyeBallColor: 'red',
            dataPattern: DataPattern.CIRCLE,
            colorDark: '#0b1257',
            colorLight: '#999c14',
            dotScale: 0.96,
            gradientType: GradientType.RADIAL,
            frameStyle: QRCodeFrame.BALLOON_TOP,
            frameColor: '#0b1257',
            frameText: 'SCAN ME',
            logoMargin: 10,
            isVCard: false,
        });
        qrCodeGenerator.build(CanvasType.SVG).then(qrCode => {
            const fs = require('fs');
            // const out = fs.createWriteStream(__dirname + '/test.png');
            // const stream = canvas.createPDFStream();
            // stream.pipe(out);
            // return out.on('finish', () => {
            //     return;
            // });
            fs.writeFileSync(__dirname + '/test.' + CanvasType.SVG.toLowerCase(), qrCode.toBuffer());
            done();
        });
    });
});