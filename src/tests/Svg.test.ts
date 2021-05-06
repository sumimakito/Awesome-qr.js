import { expect } from 'chai';
import 'mocha';
import { CanvasType, DataPattern, EyeBallShape, EyeFrameShape, GradientType, QRCodeFrame, QRErrorCorrectLevel } from '../Enums';
import { QRCodeBuilder } from '../index';
import { QRCode } from '../Models';
import { QRCodeConfig } from '../Types';



describe('SVG QRCode class tests', () => {
    it('Main test', () => {
        const defaultConfig: QRCodeConfig = {
            size: 800,
            margin: 20,
            typeNumber: 4,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRErrorCorrectLevel.M,
            backgroundDimming: 'rgba(0,0,0,0)',
            logoScale: 0.2,
            logoMargin: 6,
            logoCornerRadius: 8,
            dotScale: 0.35,
            text: 'test',
            maskedDots: false,
        };
        const qrCode = new QRCode(-1, defaultConfig);
        expect(qrCode.modules[0]).to.eql([true, true, true, true, true, true, true, false, true, true, false, false, false, false, true, true, true, true, true, true, true]);
        expect(qrCode.modules[1]).to.eql([true, false, false, false, false, false, true, false, true, true, true, false, true, false, true, false, false, false, false, false, true]);
        expect(qrCode.modules[2]).to.eql([true, false, true, true, true, false, true, false, false, false, false, true, true, false, true, false, true, true, true, false, true]);
        expect(qrCode.modules[3]).to.eql([true, false, true, true, true, false, true, false, true, true, true, true, true, false, true, false, true, true, true, false, true]);
        expect(qrCode.modules[4]).to.eql([true, false, true, true, true, false, true, false, false, true, true, false, false, false, true, false, true, true, true, false, true]);
        expect(qrCode.modules[5]).to.eql([true, false, false, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false, false, false, true]);
        expect(qrCode.modules[6]).to.eql([true, true, true, true, true, true, true, false, true, false, true, false, true, false, true, true, true, true, true, true, true]);
        expect(qrCode.modules[7]).to.eql([false, false, false, false, false, false, false, false, true, false, true, false, false, false, false, false, false, false, false, false, false]);
        expect(qrCode.modules[8]).to.eql([true, false, true, true, false, true, true, true, false, false, true, false, false, false, true, false, false, true, false, true, true]);
        expect(qrCode.modules[9]).to.eql([true, true, true, true, true, false, false, false, false, false, true, false, true, false, false, true, false, true, true, false, true]);
        expect(qrCode.modules[10]).to.eql([false, false, true, false, true, true, true, true, true, true, false, false, true, true, true, true, true, false, false, true, true]);
        expect(qrCode.modules[11]).to.eql([false, false, false, false, false, false, false, false, true, false, false, false, true, true, false, false, false, true, false, true, false]);
        expect(qrCode.modules[12]).to.eql([true, false, false, true, false, false, true, false, true, false, false, true, false, true, false, false, true, true, false, true, false]);
        expect(qrCode.modules[13]).to.eql([false, false, false, false, false, false, false, false, true, true, false, false, false, true, false, true, false, true, false, true, false]);
        expect(qrCode.modules[14]).to.eql([true, true, true, true, true, true, true, false, true, true, false, false, false, true, true, false, true, true, true, false, false]);
        expect(qrCode.modules[15]).to.eql([true, false, false, false, false, false, true, false, true, false, true, true, true, true, true, false, false, true, true, false, false]);
        expect(qrCode.modules[16]).to.eql([true, false, true, true, true, false, true, false, false, true, false, true, false, false, true, false, false, false, true, true, true]);
        expect(qrCode.modules[17]).to.eql([true, false, true, true, true, false, true, false, true, true, false, false, false, true, false, false, true, true, false, true, false]);
        expect(qrCode.modules[18]).to.eql([true, false, true, true, true, false, true, false, true, false, false, true, false, true, false, false, true, false, true, false, false]);
        expect(qrCode.modules[19]).to.eql([true, false, false, false, false, false, true, false, false, true, true, true, true, false, true, false, true, true, false, false, true]);
        expect(qrCode.modules[20]).to.eql([true, true, true, true, true, true, true, false, true, true, true, true, true, false, false, true, false, false, false, false, false]);
    });
});
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
const config6 = {
   // backgroundColor:'white',
    canvasType: CanvasType.SVG,
    colorDark: "red",
    colorLight: "green",
    correctLevel: 2,
    dataPattern: DataPattern.KITE,
    dotScale: 0.96,
    eyeBallShape: EyeBallShape.SQUARE,
    // eyeFrameColor: "",
    eyeFrameShape: EyeFrameShape.RIGHT_LEAF,
    frameStyle: QRCodeFrame.CIRCULAR,
    frameColor: "blue",
    frameText: "Scan QR",
    gradientType: GradientType.RADIAL,
   // imageServerURL: "https://beaconstacqa.mobstac.com/api/2.0/validate_url/",
    isVCard: false,
    logoCornerRadius: 8,
    logoMargin: 11,
    logoScale: 0.26,
    margin: 80,
    maskedDots: false,
   size: 1051,
    text: "https://www.google.com/search?q=google+image&sxsrf=ALeKk01HdEjd-1kgx0opDH4z57mKAKdSfg:1619608675472&source=lnms&tbm=isch&sa=X&ved=2ahUKEwja3Zq-6KDwAhVDjOYKHeseBpQQ_AUoAXoECAEQAw&biw=1853&bih=949#imgrc=NaNXoifrEY1VZM",
   typeNumber: 4,
   useCanvas: false,
   useOpacity: false,
   viewportSize: 891,
};
const config7 = {
    canvasType: CanvasType.SVG,
    backgroundColor:'white',
    colorDark: "blue",
    colorLight: "green",
    dataPattern: DataPattern.KITE,
    dotScale: 1,
    eyeBallShape: EyeBallShape.CIRCLE,
    // eyeFrameColor: "",
    eyeFrameShape: EyeFrameShape.CIRCLE,
    frameStyle: QRCodeFrame.CIRCULAR,
    frameColor: "blue",
    frameText: "Scan QR",
    gradientType: GradientType.VERTICAL,
   // imageServerURL: "https://beaconstacqa.mobstac.com/api/2.0/validate_url/",

    text: "https://www.google.com/search?q=google+image&sxsrf=ALeKk01HdEjd-1kgx0opDH4z57mKAKdSfg:1619608675472&source=lnms&tbm=isch&sa=X&ved=2ahUKEwja3Zq-6KDwAhVDjOYKHeseBpQQ_AUoAXoECAEQAw&biw=1853&bih=949#imgrc=NaNXoifrEY1VZM",
};
const config8 = {
    canvasType: CanvasType.SVG,
    colorDark: "blue",
    colorLight: "green",
    dataPattern: DataPattern.LEFT_DIAMOND,
    dotScale: 1,
    eyeBallShape: EyeBallShape.CIRCLE,
    // eyeFrameColor: "",
    eyeFrameShape: EyeFrameShape.CIRCLE,
    frameStyle: QRCodeFrame.CIRCULAR,
    frameColor: "blue",
    frameText: "Scan QR",
    gradientType: GradientType.VERTICAL,
   // imageServerURL: "https://beaconstacqa.mobstac.com/api/2.0/validate_url/",

    text: "https://google.com",
};
const config9 = {
    canvasType: CanvasType.SVG,
    colorDark: "blue",
    colorLight: "green",
    dataPattern: DataPattern.RIGHT_DIAMOND,
    dotScale: 1,
    eyeBallShape: EyeBallShape.CIRCLE,
    // eyeFrameColor: "",
    eyeFrameShape: EyeFrameShape.CIRCLE,
    frameStyle: QRCodeFrame.CIRCULAR,
    frameColor: "blue",
    frameText: "Scan QR",
    gradientType: GradientType.VERTICAL,
   // imageServerURL: "https://beaconstacqa.mobstac.com/api/2.0/validate_url/",

    text: "https://google.com",
};
const config10 = {
    canvasType: CanvasType.SVG,
    colorDark: "red",
    colorLight: "green",
    dataPattern: DataPattern.SQUARE,
    dotScale: 1,
    eyeBallShape: EyeBallShape.CIRCLE,
    // eyeFrameColor: "",
    eyeFrameShape: EyeFrameShape.CIRCLE,
    frameStyle: QRCodeFrame.CIRCULAR,
    frameColor: "blue",
    frameText: "Scan QR",
    gradientType: GradientType.VERTICAL,
   // imageServerURL: "https://beaconstacqa.mobstac.com/api/2.0/validate_url/",

    text: "https://google.com",
};
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
it('Main test SVG 6 circular', done => {
    const qrCodeGenerator = new QRCodeBuilder(config6);

    qrCodeGenerator.build(CanvasType.SVG).then(qrCode => {
        const fs = require('fs');
        fs.writeFileSync(__dirname + '/circular-kite.' + CanvasType.SVG.toLowerCase(), qrCode.toBuffer());
        done();
    }).catch(err => {
       console.error(err);
        done();
    });
});
it('Main test SVG 7 circular with large text', done => {
    const qrCodeGenerator = new QRCodeBuilder(config7);

    qrCodeGenerator.build(CanvasType.SVG).then(qrCode => {
        const fs = require('fs');
        fs.writeFileSync(__dirname + '/circular-circle.' + CanvasType.SVG.toLowerCase(), qrCode.toBuffer());
        done();
    }).catch(err => {
       console.error(err);
        done();
    });
});
it('Main test SVG 8 circular', done => {
    const qrCodeGenerator = new QRCodeBuilder(config8);

    qrCodeGenerator.build(CanvasType.SVG).then(qrCode => {
        const fs = require('fs');
        fs.writeFileSync(__dirname + '/circular-leftdiamond.' + CanvasType.SVG.toLowerCase(), qrCode.toBuffer());
        done();
    }).catch(err => {
       console.error(err);
        done();
    });
});
it('Main test SVG 9 circular', done => {
    const qrCodeGenerator = new QRCodeBuilder(config9);

    qrCodeGenerator.build(CanvasType.SVG).then(qrCode => {
        const fs = require('fs');
        fs.writeFileSync(__dirname + '/circular-rightdiamond.' + CanvasType.SVG.toLowerCase(), qrCode.toBuffer());
        done();
    }).catch(err => {
       console.error(err);
        done();
    });
});
it('Main test SVG 10 circular', done => {
    const qrCodeGenerator = new QRCodeBuilder(config10);

    qrCodeGenerator.build(CanvasType.SVG).then(qrCode => {
        const fs = require('fs');
        fs.writeFileSync(__dirname + '/circular-sqaure.' + CanvasType.SVG.toLowerCase(), qrCode.toBuffer());
        done();
    }).catch(err => {
       console.error(err);
        done();
    });
});