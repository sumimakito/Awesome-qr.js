import { expect } from 'chai';
import 'mocha';
import { CanvasType, DataPattern, EyeBallShape, EyeFrameShape, GradientType, QRCodeFrame, QRErrorCorrectLevel } from '../Enums';
import { QRCodeBuilder } from '../index';
import { QR8bitByte, QRCode, QRPolynomial } from '../Models';
import { QRCodeConfig } from '../Types';

describe('QR8bitByte class tests', () => {
    it('QR8bitByte.getLength for non utf-8 chars', () => {
        const bitByte = new QR8bitByte('test');
        expect(bitByte.getLength()).to.equals(4);
    });

    it('QR8bitByte.getLength for utf-8 chars > 800', () => {
        const bitByte = new QR8bitByte('test𐀀');
        expect(bitByte.getLength()).to.equals(13);
    });
});

describe('QRPolynomial class tests', () => {
    it('Get length without leading 0 array', () => {
        const polynomial = new QRPolynomial([1, 2, 3], 2);
        expect(polynomial.getLength()).to.equals(5);
    });

    it('Get length with leading 0 array', () => {
        const polynomial = new QRPolynomial([0, 0, 1, 2, 3], 2);
        expect(polynomial.getLength()).to.equals(5);
    });

    it('get() test', () => {
        const polynomial = new QRPolynomial([0, 0, 1, 2, 3], 2);
        expect(polynomial.get(0)).to.equals(1);
    });

    it('multiply', () => {
        const qrPolynomial1 = new QRPolynomial([1, 2, 3], 2);
        const qrPolynomial2 = new QRPolynomial([4, 5, 6], 2);
        const newPoly = qrPolynomial1.multiply(qrPolynomial2);
        expect(newPoly.num).to.eql([4, 13, 0, 3, 10, 0, 0, 0, 0]);
    });

    it('mod', () => {
        const qrPolynomial1 = new QRPolynomial([1, 2, 3], 2);
        const qrPolynomial2 = new QRPolynomial([4, 5, 6], 2);
        const newPoly = qrPolynomial1.mod(qrPolynomial2);
        expect(newPoly.num).to.eql([68, 140, 0, 0]);
    });

});

describe('QRCode class tests', () => {
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
    logoImage: 'https://i.pinimg.com/474x/d4/48/2b/d4482ba4e7ebdbff7b8ba73e7d39aceb.jpg',
    backgroundImage: 'https://i.pinimg.com/474x/d4/48/2b/d4482ba4e7ebdbff7b8ba73e7d39aceb.jpg',
    backgroundColor: 'white',
    canvasType: CanvasType.SVG,
    eyeFrameShape: EyeFrameShape.SQUARE,
    eyeBallShape: EyeBallShape.SQUARE,
    dataPattern: DataPattern.SQUARE,
   colorDark: 'yellow',
   colorLight: '#4494fc',
    dotScale: 1,
     gradientType: GradientType.NONE,
    frameStyle: QRCodeFrame.NONE,
    frameColor: 'blue',
    frameText: 'HEY QR',
    logoMargin: 20,
    logoScale: 0.25,
    margin: 80,
    typeNumber: 5,
    size: 1024,
    isVCard: false,
    useCanvas: false,
    useOpacity: true,
};
const config2 = {
    text: 'https://www.beaconstac.com',
   // backgroundImage: 'https://s3.amazonaws.com/beaconstac-content-qa/1593/9653e5dae58849b9bf523e27142f875e',
    backgroundColor: 'white',
    canvasType: CanvasType.SVG,
    eyeFrameShape: EyeFrameShape.CIRCLE,
    eyeBallShape: EyeBallShape.CIRCLE,
    dataPattern: DataPattern.CIRCLE,
   colorDark: 'yellow',
   colorLight: '#4494fc',
    dotScale: 1,
     gradientType: GradientType.LINEAR,
    frameStyle: QRCodeFrame.BOX_BOTTOM,
    frameColor: 'blue',
    frameText: 'HEY QR',
    logoMargin: 20,
    logoScale: 0.25,
    margin: 80,
    typeNumber: 5,
    size: 512,
    isVCard: false,
    useCanvas: false,
    useOpacity: true,
};
const config3 = {
    text: 'https://www.beaconstac.com',
   backgroundImage: 'https://s3.amazonaws.com/beaconstac-content-qa/1593/9653e5dae58849b9bf523e27142f875e',
   imageServerURL: 'https://s3.amazonaws.com/beaconstac-content-qa/1593/9653e5dae58849b9bf523e27142f875e',
    backgroundColor: 'white',
    canvasType: CanvasType.SVG,
    eyeFrameShape: EyeFrameShape.ROUNDED,
    eyeBallShape: EyeBallShape.ROUNDED,
    dataPattern: DataPattern.KITE,
   colorDark: 'yellow',
   colorLight: '#4494fc',
    dotScale: 1,
     gradientType: GradientType.RADIAL,
    frameStyle: QRCodeFrame.BOX_TOP,
    frameColor: 'blue',
    frameText: 'HEY QR',
    logoMargin: 20,
    logoScale: 0.25,
    margin: 80,
    typeNumber: 5,
    size: 256,
    isVCard: false,
    useCanvas: false,
    useOpacity: true,
};
const config4 = {
    text: 'https://www.beaconstac.com',
   // backgroundImage: 'https://s3.amazonaws.com/beaconstac-content-qa/1593/9653e5dae58849b9bf523e27142f875e',
    backgroundColor: 'white',
    canvasType: CanvasType.SVG,
    eyeFrameShape: EyeFrameShape.RIGHT_LEAF,
    eyeBallShape: EyeBallShape.ROUNDED,
    dataPattern: DataPattern.LEFT_DIAMOND,
   colorDark: 'yellow',
   colorLight: '#4494fc',
    dotScale: 1,
    gradientType: GradientType.HORIZONTAL,
    frameColor: 'blue',
    frameText: 'HEY QR frame text len greater than twelve',
    logoMargin: 20,
    logoScale: 0.25,
    margin: 80,
    typeNumber: 5,
    size: 256,
    isVCard: false,
    useCanvas: false,
    useOpacity: true,
};
const config5 = {
    text: 'https://www.beaconstac.com',
   // backgroundImage: 'https://s3.amazonaws.com/beaconstac-content-qa/1593/9653e5dae58849b9bf523e27142f875e',
    backgroundColor: 'white',
    canvasType: CanvasType.SVG,
    eyeFrameShape: EyeFrameShape.LEFT_LEAF,
    eyeBallShape: EyeBallShape.LEFT_LEAF,
   colorDark: 'yellow',
   dataPattern: DataPattern.LEFT_DIAMOND,
   colorLight: '#4494fc',
    dotScale: 1,
    gradientType: GradientType.HORIZONTAL,
    frameColor: 'blue',
    frameText: 'HEY QR frame',
    frameStyle: QRCodeFrame.BANNER_TOP,
    logoMargin: 20,
    logoScale: 0.25,
    margin: 80,
    typeNumber: 5,
    size: 256,
    isVCard: true,
    useCanvas: true,
    useOpacity: true,
};
const config6 = {
    text: 'https://www.beaconstac.com',
   // backgroundImage: 'https://s3.amazonaws.com/beaconstac-content-qa/1593/9653e5dae58849b9bf523e27142f875e',
    backgroundColor: 'white',
    canvasType: CanvasType.SVG,
    eyeFrameShape: EyeFrameShape.RIGHT_LEAF,
    eyeBallShape: EyeBallShape.RIGHT_LEAF,
    dataPattern: DataPattern.RIGHT_DIAMOND,
   colorDark: 'yellow',
   colorLight: '#4494fc',
    dotScale: 1,
    gradientType: GradientType.VERTICAL,
    frameColor: 'blue',
    frameText: 'HEY QR frame',
    frameStyle: QRCodeFrame.BANNER_BOTTOM,
    logoMargin: 20,
    logoScale: 0.25,
    margin: 80,
    typeNumber: 5,
    size: 256,
    isVCard: false,
    useCanvas: false,
    useOpacity: false,
};
const config7 = {
    text: 'https://s3.amazonaws.com/beaconstac-content-qa/1593/9653e5dae58849b9bf523e27142f875e',
   // backgroundImage: 'https://s3.amazonaws.com/beaconstac-content-qa/1593/9653e5dae58849b9bf523e27142f875e',
    backgroundColor: 'white',
    canvasType: CanvasType.SVG,
    eyeFrameShape: EyeFrameShape.RIGHT_LEAF,
    eyeBallShape: EyeBallShape.LEFT_DIAMOND,
   colorDark: 'yellow',
   colorLight: '#4494fc',
    dotScale: 1,
    gradientType: GradientType.HORIZONTAL,
    frameColor: 'blue',
    frameText: 'HEY QR frame',
    logoMargin: 20,
    logoScale: 0.25,
    margin: 80,
    frameStyle: QRCodeFrame.BALLOON_BOTTOM,
    typeNumber: 5,
    size: 256,
    isVCard: false,
    useCanvas: false,
    useOpacity: false,
};
const config8 = {
    text: 'https://www.google.com/search?q=google+image&sxsrf=ALeKk01HdEjd-1kgx0opDH4z57mKAKdSfg:1619608675472&source=lnms&tbm=isch&sa=X&ved=2ahUKEwja3Zq-6KDwAhVDjOYKHeseBpQQ_AUoAXoECAEQAw&biw=1853&bih=949#imgrc=NaNXoifrEY1VZM',
   // backgroundImage: 'https://s3.amazonaws.com/beaconstac-content-qa/1593/9653e5dae58849b9bf523e27142f875e',
    backgroundColor: 'white',
    canvasType: CanvasType.SVG,
    eyeFrameShape: EyeFrameShape.RIGHT_LEAF,
    eyeBallShape: EyeBallShape.RIGHT_DIAMOND,
   colorDark: 'yellow',
   colorLight: '#4494fc',
    dotScale: 1,
    gradientType: GradientType.HORIZONTAL,
    frameColor: 'blue',
    frameText: 'HEY QR frame',
    logoMargin: 20,
    logoScale: 0.25,
    frameStyle: QRCodeFrame.BALLOON_TOP,
    margin: 80,
    typeNumber: 5,
    size: 256,
    isVCard: false,
    useCanvas: false,
    useOpacity: false,
};

describe('PNG QR code tests', () => {
    // it('Main test SVG', done => {
    //     const qrCodeGenerator = new QRCodeBuilder(config);
    //
    //     qrCodeGenerator.build(CanvasType.SVG).then(qrCode => {
    //         const fs = require('fs');
    //         fs.writeFileSync(__dirname + '/test.' + CanvasType.SVG.toLowerCase(), qrCode.toBuffer());
    //         done();
    //     }).catch(err => {
    //         console.error(err);
    //         done();
    //     });
    // });

    it('Main test QR 1', done => {
        const qrCodeGenerator = new QRCodeBuilder(config);

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
            const fileName = '/test' + "." + extension;
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
    it('Main test QR 2', done => {
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
    it('Main test QR 3', done => {
        const qrCodeGenerator = new QRCodeBuilder(config3);

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
            const fileName = '/test3' + "." + extension;
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
    it('Main test QR 4', done => {
        const qrCodeGenerator = new QRCodeBuilder(config4);

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
            const fileName = '/test4' + "." + extension;
            fs.writeFileSync(__dirname+fileName, imageBuffer);
            // console.log(dataUrl.substr(0,200));
            // fs.writeFileSync(__dirname + '/test.' + CanvasType.SVG.toLowerCase(), qrCode.toBuffer());
            done();
            
            
            // const fs = require('fs');
            // fs.writeFileSync(__dirname + '/test.' + CanvasType.SVG.toLowerCase(), qrCode.toBuffer());
            // done();
        }).catch(err => {
            expect(err).to.equal('Frame text length exceeded');
            done();
        });
    });
    it('Main test QR 5', done => {
        const qrCodeGenerator = new QRCodeBuilder(config5);

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
            const fileName = '/test5' + "." + extension;
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
    it('Main test QR 6', done => {
        const qrCodeGenerator = new QRCodeBuilder(config6);

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
            const fileName = '/test6' + "." + extension;
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
    it('Main test QR 7', done => {
        const qrCodeGenerator = new QRCodeBuilder(config7);

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
            const fileName = '/test7' + "." + extension;
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
    it('Main test QR 8 very large text', done => {
        const qrCodeGenerator = new QRCodeBuilder(config8);

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
            const fileName = '/test8' + "." + extension;
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