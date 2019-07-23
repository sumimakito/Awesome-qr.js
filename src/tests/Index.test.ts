import 'mocha';
import { CanvasType, EyeBallShape, EyeFrameShape, DataPattern } from '../Enums';
import { QRCodeBuilder } from '../index';

describe('QR code tests', () => {
    it('Main test', done => {
        const qrCodeGenerator = new QRCodeBuilder({
            text: 'http://www.beaconstac.com/',
            backgroundImage: 'https://image.flaticon.com/teams/slug/google.jpg',
            logoImage: __dirname + '/pokemon.png',
            canvasType: CanvasType.SVG,
            eyeFrameShape: EyeFrameShape.ROUNDED,
            eyeBallShape: EyeBallShape.RIGHT_DIAMOND,
            eyeFrameColor: '#000000',
            eyeBallColor: '#ad10aa',
            dataPattern: DataPattern.CIRCLE,
            colorDark: '#22aad4',
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
