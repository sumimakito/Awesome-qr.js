import 'mocha';
import { CanvasType, EyeBallShape, EyeFrameShape, DataPattern, GradientType, QRCodeFrame } from '../Enums';
import { QRCodeBuilder } from '../index';

describe('QR code tests', () => {
    it('Main test', done => {
        const qrCodeGenerator = new QRCodeBuilder({
            text: 'http://www.beaconstac.com/',
            backgroundImage: 'https://image.flaticon.com/teams/slug/google.jpg',
            // backgroundColor: '#999999',
            logoImage: 'https://static.beaconstac.com/assets/img/qr-code-logos/instagram.svg',
            canvasType: CanvasType.SVG,
            eyeFrameShape: EyeFrameShape.ROUNDED,
            eyeBallShape: EyeBallShape.ROUNDED,
            eyeFrameColor: '#287314',
            eyeBallColor: '#234',
            dataPattern: DataPattern.KITE,
            colorDark: '#0b1257',
            // colorLight: '#999c14',
            dotScale: 0.96,
            // gradientType: GradientType.RADIAL,
            // frameStyle: QRCodeFrame.BOX_BOTTOM,
            // frameColor: '#0b1257',
            // frameText: 'SCAN ME',
            logoMargin: 4,
            logoScale: 0.25,
            margin: 80,
            size: 512,
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
        }).catch(err => {
            console.error(err);
            done();
        });
    });
});
