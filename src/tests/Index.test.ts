import 'mocha';
import { CanvasType, DataPattern,Design, EyeBallShape, EyeFrameShape, GradientType, QRCodeFrame, QRErrorCorrectLevel } from '../Enums';
import { QRCodeBuilder } from '../index';

const vCardSampleData = `BEGIN:VCARD
VERSION:3.0
N:fgdgdfg;dfdagfsg;;
FN:dfdagfsg fgdgdfg
ORG:fgfdgdfgdf;
TITLE:fdgdfg
TEL;TYPE=work:213213
TEL;TYPE=mobile:523355
TEL;TYPE=home:342524
EMAIL:souro.com@gmail.com
ADR;TYPE=WORK:;;eafe, thgsh;Bangalore;KA;560008;India
URL:souro.comf
REV:2008-04-24T19:52:43Z
END:VCARD`;

const config = {
    text: 'https://www.beaconstac.com',
   // backgroundImage: 'https://s3.amazonaws.com/beaconstac-content-qa/1593/9653e5dae58849b9bf523e27142f875e',
    backgroundColor: '#000000',
    canvasType: CanvasType.SVG,
    eyeFrameShape: EyeFrameShape.ROUNDED,
    eyeBallShape: EyeBallShape.ROUNDED,
    colorDark: 'yellow',
    colorLight: '#4494fc',
    dotScale: 1,
    gradientType: GradientType.VERTICAL,
    // frameStyle: QRCodeFrame.BALLOON_BOTTOM,
    frameColor: '#0b1257',
    // frameText: 'HEY QR',
    // logoMargin: 10,
    // logoScale: 0.25,
    // margin: 80,
    size: 2048,
    designStyle:Design.Circular,
    designBorder:true,
    isVCard: false,
    useCanvas: false,
    useOpacity: true,
};

describe('QR code tests', () => {
    it('Main test SVG', done => {
        const qrCodeGenerator = new QRCodeBuilder(config);

        qrCodeGenerator.build(CanvasType.SVG).then(qrCode => {
            

            // const fs = require('fs');
             
            // const out = fs.createWriteStream(__dirname + '/test.png');
            // const stream = canvas.createPDFStream();
            // stream.pipe(out);
            // return out.on('finish', () => {
            //     return;
            // });
            // const dataUrl = qrCode.canvas.toDataURL('image/png');
            // const matches: any = dataUrl.match(
            //         /^data:([A-Za-z-+\/]+);base64,(.+)$/
            //       ),
            //     response: any  ={};
            // response.type = matches[1];
            // response.data = Buffer.from(matches[2], "base64");
            // const decodedImg = response;
            // const imageBuffer = decodedImg.data;
            // const extension ='png';
            // const fileName = '/test' + "." + extension;
            // fs.writeFileSync(__dirname+fileName, imageBuffer);
            // // console.log(dataUrl.substr(0,200));
            // // fs.writeFileSync(__dirname + '/test.' + CanvasType.SVG.toLowerCase(), qrCode.toBuffer());
            // done();


            const fs = require('fs');
            fs.writeFileSync(__dirname + '/test.' + CanvasType.SVG.toLowerCase(), qrCode.toBuffer());
            done();
        }).catch(err => {
           console.error(err);
            done();
        });
    });
});
