import 'mocha';
import { CanvasType, DataPattern, EyeBallShape, EyeFrameShape, GradientType, QRCodeFrame, QRErrorCorrectLevel } from '../Enums';
import { QRCodeBuilder } from '../index';
import { QRCode } from '../Models';

// tslint:disable-next-line:no-var-requires
const fs = require('fs');

const vCardSampleData = `BEGIN:VCARD
VERSION:3.0
N:fgdgdfg;dfdagfsg;;
FN:dfdagfsg fgdgdfg
ORG:fgfdgdfgdf;
TITLE:fdgdfg
TEL;TYPE=work:213213
TEL;TYPE=mobile:523355
TEL;TYPE=home:342524
EMAIL:test.com@gmail.com
ADR;TYPE=WORK:;;eafe, thgsh;Bangalore;KA;560008;India
URL:test.comf
REV:2008-04-24T19:52:43Z
END:VCARD`;

const sampleUrl = 'https://www.beaconstac.com';

// 1. basic square qr code with size: 1024 and error correction: 2 | type: png
const config1 = {
    text: sampleUrl,
    canvasType: CanvasType.PNG,
    dataPattern: DataPattern.SQUARE,
    colorDark: "#000000",
    colorLight: "#ffffff",
    dotScale: 1,
    margin: 80,
    size: 1024,
    isVCard: false,
    useOpacity: true,
    correctLevel: QRErrorCorrectLevel.H
};

// 2. basic square qr code with size: 1024 and error correction: 2 | type: svg
const config2 = {
    text: sampleUrl,
    canvasType: CanvasType.SVG,
    dataPattern: DataPattern.SQUARE,
    colorDark: "#000000",
    colorLight: "#ffffff",
    dotScale: 1,
    margin: 80,
    size: 1024,
    isVCard: false,
    useOpacity: true,
    correctLevel: QRErrorCorrectLevel.H
};


// 3. basic square qr code with v-card, with size: 1024 and error correction: 2 | type: png
const config3 = {
    text: vCardSampleData,
    canvasType: CanvasType.PNG,
    dataPattern: DataPattern.SQUARE,
    colorDark: "#000000",
    colorLight: "#ffffff",
    dotScale: 1,
    margin: 80,
    size: 1024,
    isVCard: false,
    useOpacity: true,
    correctLevel: QRErrorCorrectLevel.H
};

// 4. basic square qr code with v-card, with size: 1024 and error correction: 2 | type: svg
const config4 = {
    text: vCardSampleData,
    canvasType: CanvasType.SVG,
    dataPattern: DataPattern.SQUARE,
    colorDark: "#000000",
    colorLight: "#ffffff",
    dotScale: 1,
    margin: 80,
    size: 1024,
    isVCard: false,
    useOpacity: true,
    correctLevel: QRErrorCorrectLevel.H
};

// circular qr code with size: 1024 and error correction: 2 | type: png
const config5 = {
    text: 'https://www.beaconstac.com',
   // backgroundImage: 'https://s3.amazonaws.com/beaconstac-content-qa/1593/9653e5dae58849b9bf523e27142f875e',
    backgroundColor: 'white',
    canvasType: CanvasType.PNG,
    eyeFrameShape: EyeFrameShape.RIGHT_LEAF,
    eyeBallShape: EyeBallShape.ROUNDED,
    dataPattern: DataPattern.LEFT_DIAMOND,
   colorDark: 'yellow',
   colorLight: '#4494fc',
    dotScale: 1,
    frameStyle: QRCodeFrame.CIRCULAR,
    gradientType: GradientType.HORIZONTAL,
    frameColor: 'blue',
    frameText: 'HEY QR',
    logoMargin: 20,
    logoScale: 0.25,
    margin: 80,
    typeNumber: 5,
    size: 1024,
    correctLevel: QRErrorCorrectLevel.H,
    isVCard: false,
    useCanvas: false,
    useOpacity: true,
};

// circular qr code with size: 1024 and error correction: 2 | type: svg
const config6 = {
    text: 'https://www.beaconstac.com',
   // backgroundImage: 'https://s3.amazonaws.com/beaconstac-content-qa/1593/9653e5dae58849b9bf523e27142f875e',
    canvasType: CanvasType.SVG,
    eyeFrameShape: EyeFrameShape.RIGHT_LEAF,
    eyeBallShape: EyeBallShape.ROUNDED,
    dataPattern: DataPattern.LEFT_DIAMOND,
   colorDark: 'yellow',
   colorLight: '#4494fc',
    dotScale: 1,
    frameStyle: QRCodeFrame.CIRCULAR,
    gradientType: GradientType.HORIZONTAL,
    frameColor: 'blue',
    frameText: 'HEY QR',
    logoMargin: 20,
    logoScale: 0.25,
    margin: 80,
    typeNumber: 5,
    size: 1024,
    correctLevel: QRErrorCorrectLevel.H,
    isVCard: false,
    useCanvas: false,
    useOpacity: true,
};

// circular qr code with v-card, with size: 1024 and error correction: 2 | type: png
const config7 = {
    text: vCardSampleData,
   // backgroundImage: 'https://s3.amazonaws.com/beaconstac-content-qa/1593/9653e5dae58849b9bf523e27142f875e',
    backgroundColor: 'white',
    canvasType: CanvasType.PNG,
    frameStyle: QRCodeFrame.CIRCULAR,
    dotScale: 1,
    frameColor: 'blue',
    frameText: 'HEY QR',
    logoMargin: 20,
    logoScale: 0.25,
    margin: 80,
    typeNumber: 5,
    size: 1024,
    correctLevel: QRErrorCorrectLevel.H,
    isVCard: true,
};

// circular qr code with v-card, with size: 1024 and error correction: 2 | type: svg
const config8 = {
    text: vCardSampleData,
   // backgroundImage: 'https://s3.amazonaws.com/beaconstac-content-qa/1593/9653e5dae58849b9bf523e27142f875e',
   frameStyle: QRCodeFrame.CIRCULAR,
    canvasType: CanvasType.SVG,
    dotScale: 1,
    frameColor: 'blue',
    frameText: 'HEY QR',
    logoMargin: 20,
    logoScale: 0.25,
    margin: 80,
    typeNumber: 5,
    size: 1024,
    correctLevel: QRErrorCorrectLevel.H,
    isVCard: true,
};

// frame + square qr code with size: 1024 and error correction: 2 | type: png
const config9 = {
    text: sampleUrl,
    canvasType: CanvasType.PNG,
    frameStyle: QRCodeFrame.BALLOON_BOTTOM,
    dataPattern: DataPattern.SQUARE,
    colorDark: "#000000",
    colorLight: "#ffffff",
    dotScale: 1,
    margin: 80,
    size: 1024,
    isVCard: false,
    useOpacity: true,
    correctLevel: QRErrorCorrectLevel.H
};

// frame + square qr code with size: 1024 and error correction: 2 | type: svg

const config10 = {
    text: sampleUrl,
    canvasType: CanvasType.SVG,
    frameStyle: QRCodeFrame.BALLOON_BOTTOM,
    dataPattern: DataPattern.SQUARE,
    colorDark: "#000000",
    colorLight: "#ffffff",
    dotScale: 1,
    margin: 80,
    size: 1024,
    isVCard: false,
    useOpacity: true,
    correctLevel: QRErrorCorrectLevel.H
};
// frame + square qr code with v-card, with size: 1024 and error correction: 2 | type: png
const config11 = {
    text: vCardSampleData,
    canvasType: CanvasType.PNG,
    frameStyle: QRCodeFrame.BOX_TOP,
    dataPattern: DataPattern.SQUARE,
    colorDark: "#000000",
    colorLight: "#ffffff",
    dotScale: 1,
    margin: 80,
    size: 1024,
    isVCard: true,
    useOpacity: true,
    correctLevel: QRErrorCorrectLevel.H
};

// frame + square qr code with v-card, with size: 1024 and error correction: 2 | type: svg
const config12 = {
    text: vCardSampleData,
    canvasType: CanvasType.SVG,
    frameStyle: QRCodeFrame.BANNER_BOTTOM,
    dataPattern: DataPattern.SQUARE,
    colorDark: "#000000",
    colorLight: "#ffffff",
    dotScale: 1,
    margin: 80,
    size: 1024,
    isVCard: true,
    useOpacity: true,
    correctLevel: QRErrorCorrectLevel.H
};

// for PNG
function prepareImageBuffer(qrCode: QRCode, name: string) {
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
    const fileName = `/qrTests/${name}` + "." + extension;

    return {
        name: fileName,
        buffer: imageBuffer
    };

}

describe('Output QR code tests', () => {
    it('QR test PNG: default', done => {
        const qrCodeGenerator = new QRCodeBuilder(config1);
        qrCodeGenerator.build(CanvasType.PNG).then(qrCode => {
            const bufferObject = prepareImageBuffer(qrCode, 'default');
            fs.writeFileSync(__dirname + bufferObject.name, bufferObject.buffer);
            done();
        }).catch(err => {
            console.error(err);
            done();
        });
    });
    it('QR test SVG: default', done => {
        const qrCodeGenerator = new QRCodeBuilder(config2);

        qrCodeGenerator.build(CanvasType.SVG).then(qrCode => {
            fs.writeFileSync(__dirname + '/qrTests/default.' + CanvasType.SVG.toLowerCase(), qrCode.toBuffer());
            done();
        }).catch(err => {
            console.error(err);
            done();
        });
    });

    it('QR test PNG: default_vcard', done => {
        const qrCodeGenerator = new QRCodeBuilder(config3);
        qrCodeGenerator.build(CanvasType.PNG).then(qrCode => {
            const bufferObject = prepareImageBuffer(qrCode, 'default_vcard');
            fs.writeFileSync(__dirname + bufferObject.name, bufferObject.buffer);
            done();
        }).catch(err => {
            console.error(err);
            done();
        });
    });
    it('QR test SVG: default_vcard', done => {
        const qrCodeGenerator = new QRCodeBuilder(config4);

        qrCodeGenerator.build(CanvasType.SVG).then(qrCode => {
            fs.writeFileSync(__dirname + '/qrTests/default_vcard.' + CanvasType.SVG.toLowerCase(), qrCode.toBuffer());
            done();
        }).catch(err => {
            console.error(err);
            done();
        });
    });
    it('QR test PNG: circular', done => {
        const qrCodeGenerator = new QRCodeBuilder(config5);
        qrCodeGenerator.build(CanvasType.PNG).then(qrCode => {
            const bufferObject = prepareImageBuffer(qrCode, 'circular_default');
            fs.writeFileSync(__dirname + bufferObject.name, bufferObject.buffer);
            done();
        }).catch(err => {
            console.error(err);
            done();
        });
    });
    it('QR test SVG: defualt_circular', done => {
        const qrCodeGenerator = new QRCodeBuilder(config6);

        qrCodeGenerator.build(CanvasType.SVG).then(qrCode => {
            fs.writeFileSync(__dirname + '/qrTests/default_circular.' + CanvasType.SVG.toLowerCase(), qrCode.toBuffer());
            done();
        }).catch(err => {
            console.error(err);
            done();
        });
    });
    it('QR test PNG: circular_vcard', done => {
        const qrCodeGenerator = new QRCodeBuilder(config7);
        qrCodeGenerator.build(CanvasType.PNG).then(qrCode => {
            const bufferObject = prepareImageBuffer(qrCode, 'circular_vcard');
            fs.writeFileSync(__dirname + bufferObject.name, bufferObject.buffer);
            done();
        }).catch(err => {
            console.error(err);
            done();
        });
    });
    it('QR test SVG: circular_vcard', done => {
        const qrCodeGenerator = new QRCodeBuilder(config8);

        qrCodeGenerator.build(CanvasType.SVG).then(qrCode => {
            fs.writeFileSync(__dirname + '/qrTests/circular_vcard.' + CanvasType.SVG.toLowerCase(), qrCode.toBuffer());
            done();
        }).catch(err => {
            console.error(err);
            done();
        });
    });
    it('QR test PNG: frame-plus-square', done => {
        const qrCodeGenerator = new QRCodeBuilder(config9);
        qrCodeGenerator.build(CanvasType.PNG).then(qrCode => {
            const bufferObject = prepareImageBuffer(qrCode, 'frame-plus-square');
            fs.writeFileSync(__dirname + bufferObject.name, bufferObject.buffer);
            done();
        }).catch(err => {
            console.error(err);
            done();
        });
    });
    it('QR test SVG: frame-plus-square', done => {
        const qrCodeGenerator = new QRCodeBuilder(config10);

        qrCodeGenerator.build(CanvasType.SVG).then(qrCode => {
            fs.writeFileSync(__dirname + '/qrTests/frame-plus-square.' + CanvasType.SVG.toLowerCase(), qrCode.toBuffer());
            done();
        }).catch(err => {
            console.error(err);
            done();
        });
    });
    it('QR test PNG: frame-plus-square-vcard', done => {
        const qrCodeGenerator = new QRCodeBuilder(config11);
        qrCodeGenerator.build(CanvasType.PNG).then(qrCode => {
            const bufferObject = prepareImageBuffer(qrCode, 'frame-plus-square-vcard');
            fs.writeFileSync(__dirname + bufferObject.name, bufferObject.buffer);
            done();
        }).catch(err => {
            console.error(err);
            done();
        });
    });
    it('QR test SVG: frame-plus-square', done => {
        const qrCodeGenerator = new QRCodeBuilder(config12);

        qrCodeGenerator.build(CanvasType.SVG).then(qrCode => {
            fs.writeFileSync(__dirname + '/qrTests/frame-plus-square-vcard.' + CanvasType.SVG.toLowerCase(), qrCode.toBuffer());
            done();
        }).catch(err => {
            console.error(err);
            done();
        });
    });
});





