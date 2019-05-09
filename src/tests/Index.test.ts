import 'mocha';
import { CanvasType } from '../Enums';
import { QRCodeBuilder } from '../index';

describe('QR code tests', () => {
    it('Main test', (done) => {
        const qrCodeGenerator = new QRCodeBuilder({
            text: 'http://www.beaconstac.com/',
            backgroundImage: 'https://image.flaticon.com/teams/slug/google.jpg',
            logoImage: __dirname + '/pokemon.png',
            canvasType: CanvasType.SVG,
        });
        qrCodeGenerator.build(CanvasType.SVG).then(canvas => {
            // console.log(canvas.toDataURL());
            const fs = require('fs');
            // const out = fs.createWriteStream(__dirname + '/test.png');
            // const stream = canvas.createPDFStream();
            // stream.pipe(out);
            // return out.on('finish', () => {
            //     return;
            // });
            fs.writeFileSync(__dirname + '/test.svg', canvas.toBuffer());
            done()
        });
    });
});
