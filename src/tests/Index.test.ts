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
    // text: vCardSampleData,
    text: 'https://www.beaconstac.com',
    backgroundImage: 'https://image.flaticon.com/teams/slug/google.jpg',
    // backgroundImage: 'https://s3.amazonaws.com/beaconstac-content-qa/1593/9653e5dae58849b9bf523e27142f875e',
    // backgroundColor: '#ccc',
    // logoImage: 'https://s3.amazonaws.com/beaconstac-content-qa/1529/cfdb6d40c166494293763baab96007f3',
    logoImage: 'https://static.beaconstac.com/assets/img/qr-code-logos/play-store.svg',
    // logoImage: 'https://s3.amazonaws.com/beaconstac-content-qa/1593/930997b9951845639b3d4f33a3580026',
    canvasType: CanvasType.SVG,
    eyeFrameShape: EyeFrameShape.RIGHT_LEAF,
    eyeBallShape: EyeBallShape.RIGHT_LEAF,
    // eyeFrameColor: '#287314',
    // eyeBallColor: '#234',
    dataPattern: DataPattern.RIGHT_DIAMOND,
    colorDark: '#571010',
    colorLight: '#d31e1e',
    dotScale: 0.96,
    gradientType: GradientType.VERTICAL,
    frameStyle: QRCodeFrame.BOX_BOTTOM,
    frameColor: '#0b1257',
    frameText: 'SCAN THIS QR',
    logoMargin: 10,
    logoScale: 0.25,
    margin: 80,
    size: 512,
    isVCard: false,
    useCanvas: false,
    useOpacity: false,
    correctLevel: QRErrorCorrectLevel.H
};

describe('QR code tests', () => {
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

    it('Main test PDF', done => {
        const qrCodeGenerator = new QRCodeBuilder(config);

        qrCodeGenerator.build(CanvasType.PDF).then(qrCode => {
            const fs = require('fs');
            fs.writeFileSync(__dirname + '/test.' + CanvasType.PDF.toLowerCase(), qrCode.toBuffer());
            done();
        }).catch(err => {
            console.error(err);
            done();
        });
    });
});
