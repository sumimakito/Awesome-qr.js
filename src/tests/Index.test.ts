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
    logoImage: "https://static.beaconstac.com/assets/img/qr-code-logos/facebook.svg",
    logoBackground: false,
    backgroundColor:'white',
    canvasType: CanvasType.SVG,
    colorDark: "red",
    colorLight: "green",
    correctLevel: 2,
    dataPattern: DataPattern.SQUARE,
    dotScale: 0.96,
    eyeBallShape: EyeBallShape.SQUARE,
    // eyeFrameColor: "",
    eyeFrameShape: EyeFrameShape.SQUARE,
    frameStyle: QRCodeFrame.BALLOON_BOTTOM,
    frameColor: "blue",
    frameText: "",
    gradientType: GradientType.NONE,
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
    canvasType: CanvasType.SVG,
    colorDark: "red",
    colorLight: "green",
    correctLevel: 2,
    dataPattern: DataPattern.SQUARE,
    dotScale: 0.96,
    eyeBallShape: EyeBallShape.CIRCLE,
    // eyeFrameColor: "",
    eyeFrameShape: EyeFrameShape.CIRCLE,
    frameStyle: QRCodeFrame.BALLOON_TOP,
    frameColor: "blue",
    frameText: "",
    gradientType: GradientType.LINEAR,
   // imageServerURL: "https://beaconstacqa.mobstac.com/api/2.0/validate_url/",
    isVCard: true,
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
const config3 = {
    backgroundColor:'white',
    canvasType: CanvasType.SVG,
    colorDark: "red",
    colorLight: "green",
    correctLevel: 2,
    dataPattern: DataPattern.CIRCLE,
    dotScale: 0.96,
    eyeBallShape: EyeBallShape.LEFT_LEAF,
    // eyeFrameColor: "",
    eyeFrameShape: EyeFrameShape.ROUNDED,
    frameStyle: QRCodeFrame.BANNER_BOTTOM,
    frameColor: "blue",
    frameText: "",
    gradientType: GradientType.RADIAL,
   // imageServerURL: "https://beaconstacqa.mobstac.com/api/2.0/validate_url/",
    isVCard: true,
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

const config4 = {
    backgroundColor:'white',
    canvasType: CanvasType.SVG,
    colorDark: "red",
    colorLight: "green",
    correctLevel: 2,
    dataPattern: DataPattern.LEFT_DIAMOND,
    dotScale: 0.96,
    eyeBallShape: EyeBallShape.LEFT_DIAMOND,
    // eyeFrameColor: "",
    eyeFrameShape: EyeFrameShape.LEFT_LEAF,
    frameStyle: QRCodeFrame.BOX_TOP,
    frameColor: "blue",
    frameText: "",
    gradientType: GradientType.HORIZONTAL,
   // imageServerURL: "https://beaconstacqa.mobstac.com/api/2.0/validate_url/",
    isVCard: true,
    logoCornerRadius: 8,
    logoMargin: 11,
    logoScale: 0.2,
    margin: 80,
    maskedDots: true,
   moduleSize: 27,
   nSize: 27,
   rawSize: 1051,
   size: 1051,
    text: "https://qr.getwifireapp.com/zy9t9e",
   typeNumber: 4,
   useCanvas: true,
   useOpacity: true,
   viewportSize: 891,
};
const config5 = {
    backgroundColor:'white',
    canvasType: CanvasType.SVG,
    colorDark: "red",
    colorLight: "green",
    correctLevel: 2,
    dataPattern: DataPattern.RIGHT_DIAMOND,
    dotScale: 0.96,
    eyeBallShape: EyeBallShape.RIGHT_DIAMOND,
    // eyeFrameColor: "",
    eyeFrameShape: EyeFrameShape.RIGHT_LEAF,
    frameStyle: QRCodeFrame.BALLOON_TOP,
    frameColor: "blue",
    frameText: "Scan QR",
    gradientType: GradientType.VERTICAL,
   // imageServerURL: "https://beaconstacqa.mobstac.com/api/2.0/validate_url/",
    isVCard: false,
    logoCornerRadius: 8,
    logoMargin: 11,
    logoScale: 0.26,
    margin: 80,
    maskedDots: false,
   moduleSize: 27,
   nSize: 27,
   rawSize: 1051,
   size: 1051,
    text: "https://www.google.com/search?q=google+image&sxsrf=ALeKk01HdEjd-1kgx0opDH4z57mKAKdSfg:1619608675472&source=lnms&tbm=isch&sa=X&ved=2ahUKEwja3Zq-6KDwAhVDjOYKHeseBpQQ_AUoAXoECAEQAw&biw=1853&bih=949#imgrc=NaNXoifrEY1VZM",
   typeNumber: 4,
   useCanvas: false,
   useOpacity: false,
   viewportSize: 891,
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
    it('Main test SVG 2', done => {
        const qrCodeGenerator = new QRCodeBuilder(config2);
        qrCodeGenerator.build(CanvasType.SVG).then(qrCode => {
            const fs = require('fs');
            fs.writeFileSync(__dirname + '/test2.' + CanvasType.SVG.toLowerCase(), qrCode.toBuffer());
            done();
        }).catch(err => {
           console.error(err);
            done();
        });
    });
    it('Main test SVG 3', done => {
        const qrCodeGenerator = new QRCodeBuilder(config3);

        qrCodeGenerator.build(CanvasType.SVG).then(qrCode => {
            const fs = require('fs');
            fs.writeFileSync(__dirname + '/test3.' + CanvasType.SVG.toLowerCase(), qrCode.toBuffer());
            done();
        }).catch(err => {
           console.error(err);
            done();
        });
    });
    it('Main test SVG 4', done => {
        const qrCodeGenerator = new QRCodeBuilder(config4);

        qrCodeGenerator.build(CanvasType.SVG).then(qrCode => {
            const fs = require('fs');
            fs.writeFileSync(__dirname + '/test4.' + CanvasType.SVG.toLowerCase(), qrCode.toBuffer());
            done();
        }).catch(err => {
           console.error(err);
            done();
        });
    });
    it('Main test SVG 5', done => {
        const qrCodeGenerator = new QRCodeBuilder(config5);

        qrCodeGenerator.build(CanvasType.SVG).then(qrCode => {
            const fs = require('fs');
            fs.writeFileSync(__dirname + '/test5.' + CanvasType.SVG.toLowerCase(), qrCode.toBuffer());
            done();
        }).catch(err => {
           console.error(err);
            done();
        });
    });
});
