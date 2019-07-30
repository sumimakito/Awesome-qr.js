import 'mocha';
import { CanvasType, EyeBallShape, EyeFrameShape, DataPattern, GradientType } from '../Enums';
import { QRCodeBuilder } from '../index';

describe('QR code tests', () => {
    it('Main test', done => {
        const qrCodeGenerator = new QRCodeBuilder({
            text: 'http://www.beaconstac.com/',
            backgroundImage: 'https://image.flaticon.com/teams/slug/google.jpg',
            logoImage: __dirname + '/pokemon.png',
            canvasType: CanvasType.SVG,
            eyeFrameShape: EyeFrameShape.LEFT_LEAF,
            eyeBallShape: EyeBallShape.RIGHT_DIAMOND,
            eyeFrameColor: '#287314',
            eyeBallColor: '#73149c',
            dataPattern: DataPattern.KITE,
            colorDark: '#0b1257',
            colorLight: '#999c14',
            dotScale: 0.96,
            gradientType: GradientType.RADIAL,
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
