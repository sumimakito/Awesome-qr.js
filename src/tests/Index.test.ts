import { Gradient } from '@svgdotjs/svg.js';
import 'mocha';
import { CanvasType, DataPattern, EyeBallShape, EyeFrameShape, GradientType, QRCodeFrame, QRErrorCorrectLevel } from '../Enums';
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
    
    backgroundImage: "https://i.pinimg.com/474x/d4/48/2b/d4482ba4e7ebdbff7b8ba73e7d39aceb.jpg",
    logoImage: "https://i.pinimg.com/474x/d4/48/2b/d4482ba4e7ebdbff7b8ba73e7d39aceb.jpg",
    backgroundColor:'white',
    canvasType: CanvasType.PNG,
    colorDark: "red",
    colorLight: "green",
    correctLevel: 2,
    dataPattern: DataPattern.SQUARE,
    dotScale: 0.96,
    eyeBallShape: EyeBallShape.CIRCLE,
    // eyeFrameColor: "",
    eyeFrameShape: EyeFrameShape.SQUARE,
    frameStyle: QRCodeFrame.CIRCULAR,
    frameColor: "blue",
    frameText: "",
    gradientType: GradientType.RADIAL,
   // imageServerURL: "https://beaconstacqa.mobstac.com/api/2.0/validate_url/",
    isVCard: false,
    logoCornerRadius: 8,
    logoMargin: 11,
    logoScale: 0.2,
    margin: 80,
    maskedDots: false,
   moduleSize: 27,
   nSize: 27,
   rawSize: 1051,
   size: 1051,
    text: "https://qr.getwifireapp.com/zy9t9e",
   typeNumber: 4,
   useCanvas: false,
   useOpacity: true,
   viewportSize: 891,
};
const config2 = {
    backgroundColor:'white',
    canvasType: CanvasType.PNG,
    colorDark: "red",
    colorLight: "green",
    correctLevel: 2,
    dataPattern: DataPattern.SQUARE,
    dotScale: 0.96,
    eyeBallShape: EyeBallShape.CIRCLE,
    // eyeFrameColor: "",
    eyeFrameShape: EyeFrameShape.SQUARE,
    frameStyle: QRCodeFrame.CIRCULAR,
    frameColor: "blue",
    frameText: "",
    gradientType: GradientType.RADIAL,
   // imageServerURL: "https://beaconstacqa.mobstac.com/api/2.0/validate_url/",
    isVCard: false,
    logoCornerRadius: 8,
    logoMargin: 11,
    logoScale: 0.2,
    margin: 80,
    maskedDots: false,
   moduleSize: 27,
   nSize: 27,
   rawSize: 1051,
   size: 1051,
    text: "https://qr.getwifireapp.com/zy9t9e",
   typeNumber: 4,
   useCanvas: false,
   useOpacity: true,
   viewportSize: 891,
};

describe('QR code tests', () => {
    it('Main test SVG', done => {
        const qrCodeGenerator = new QRCodeBuilder(config);

        qrCodeGenerator.build(CanvasType.SVG).then(qrCode => {
            


            const fs = require('fs');
            fs.writeFileSync(__dirname + '/test.' + CanvasType.SVG.toLowerCase(), qrCode.toBuffer());
            done();
        }).catch(err => {
           console.error(err);
            done();
        });
    });
    it('Main test PNG', done => {
        const qrCodeGenerator = new QRCodeBuilder(config2);

        qrCodeGenerator.build(CanvasType.PNG).then(qrCode => {
            
            const fs = require('fs');
             
            const dataUrl = qrCode.canvas.toDataURL('image/png');
            const matches: any = dataUrl.match(
                    /^data:([A-Za-z-+\/]+);base64,(.+)$/
                  ),
                response: any  ={};
            response.type = matches[1];
            response.data = Buffer.from(matches[2], "base64");
            const decodedImg = response;
            const imageBuffer = decodedImg.data;
            const extension ='png';
            const fileName = '/test2' + "." + extension;
            fs.writeFileSync(__dirname+fileName, imageBuffer);
            // console.log(dataUrl.substr(0,200));
            // fs.writeFileSync(__dirname + '/test.' + CanvasType.SVG.toLowerCase(), qrCode.toBuffer());
            done();
            
            
            // const fs = require('fs');
            // fs.writeFileSync(__dirname + '/test.' + CanvasType.SVG.toLowerCase(), qrCode.toBuffer());
            // done();
        }).catch(err => {
            done();
        });
    });
});
