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
    text: 'https://beaconstac.com',
  //  backgroundImage: 'https://i.pinimg.com/474x/d4/48/2b/d4482ba4e7ebdbff7b8ba73e7d39aceb.jpg',
 // backgroundImage:'https://www.fnordware.com/superpng/pnggrad16rgb.png',
 // backgroundImage:'https://png.pngtree.com/png-clipart/20200721/original/pngtree-design-scene-prototype-renderings-logo-sample-material-png-image_4913697.jpg',
  logoImage:'https://svgsilh.com/svg/1295041.svg', 
 // logoImage: 'https://content.internetretailing.net/AcuCustom/Sitename/DAM/027/HSS-Hire-logo-3D2-1024x369.jpg',   
backgroundColor:'white',
logoBackground: true,
    canvasType: CanvasType.SVG,
    dataPattern: DataPattern.KITE,
    dotScale: 1,
    eyeBallShape: EyeBallShape.CIRCLE,
    // eyeFrameColor: "",
    eyeFrameShape: EyeFrameShape.CIRCLE,
    frameStyle: QRCodeFrame.NONE,
    frameColor: "blue",
    frameText: "",
    gradientType: GradientType.NONE,
    logoScale: 1,
    rectangular: true,
    logoWidth: 2500,
    heightSize: 5000,
  //  useOpacity: true,
   // imageServerURL: "https://beaconstacqa.mobstac.com/api/2.0/validate_url/",
    size:2048,
};

describe('QR code tests', () => {
    it('Main test SVG 1', done => {
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
});
