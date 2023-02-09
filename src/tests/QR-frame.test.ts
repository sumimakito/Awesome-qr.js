import 'mocha';
import { CanvasType, DataPattern, EyeBallShape, EyeFrameShape, GradientType, QRCodeFrame, QRErrorCorrectLevel } from '../Enums';
import { QRCodeBuilder } from '../index';
import { QRCode } from '../Models';

// tslint:disable-next-line:no-var-requires
const fs = require('fs');

const frameStyle = QRCodeFrame.BANNER_TOP;
const size = 1024;

const fileNameSuffix = `${frameStyle}_${size}_c`

const c_12 = {
    text: "www.beaconstac.com",
    canvasType: CanvasType.SVG,
    dotScale: 1,
    colorDark: "#13544A",
    frameStyle: frameStyle,
    frameText: "QQQQQQQQQQQQ",
    frameColor: "#0E9E88",
    size:size,
    margin: 40/512*size
};

const c_16 = {
    text: "www.beaconstac.com",
    canvasType: CanvasType.SVG,
    dotScale: 1,
    colorDark: "#13544A",
    frameStyle: frameStyle,
    frameText: "QQQQQQQQQQQQQQQQ",
    frameColor: "#0E9E88",
    size:size,
    margin: 40/512*size
};

const c_20 = {
    text: "www.beaconstac.com",
    canvasType: CanvasType.SVG,
    dotScale: 1,
    colorDark: "#13544A",
    frameStyle: frameStyle,
    frameText: "QQQQQQQQQQQQQQQQQQQQ",
    frameColor: "#0E9E88",
    size:size,
    margin: 40/512*size
};

const c_24 = {
    text: "www.beaconstac.com",
    canvasType: CanvasType.SVG,
    dotScale: 1,
    colorDark: "#13544A",
    frameStyle: frameStyle,
    frameText: "QQQQQQQQQQQQQQQQQQQQQQQQ",
    frameColor: "#0E9E88",
    size:size,
    margin: 40/512*size
};

const c_27 = {
    text: "www.beaconstac.com",
    canvasType: CanvasType.SVG,
    dotScale: 1,
    colorDark: "#13544A",
    frameStyle: frameStyle,
    frameText: "QQQQQQQQQQQQQQQQQQQQQQQQQQQ",
    frameColor: "#0E9E88",
    size:size,
    margin: 40/512*size
};

const c_30 = {
    text: "www.beaconstac.com",
    canvasType: CanvasType.SVG,
    dotScale: 1,
    colorDark: "#13544A",
    frameStyle: frameStyle,
    frameText: "QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ",
    frameColor: "#0E9E88",
    size:size,
    margin: 40/512*size
};


describe('QR code frame tests', () => {
    it('Frame test SVG 12 characters', done => {
        const qrCodeGenerator = new QRCodeBuilder(c_12);
        qrCodeGenerator.build(CanvasType.SVG).then(qrCode => {
            fs.writeFileSync(__dirname + `/frameTests/${fileNameSuffix}_12.` + CanvasType.SVG.toLowerCase(), qrCode.svg);
            done();
        }).catch(err => {
            console.error(err);
            done();
        });
    });
    it('Frame test SVG 16 characters', done => {
        const qrCodeGenerator = new QRCodeBuilder(c_16);
        qrCodeGenerator.build(CanvasType.SVG).then(qrCode => {
            fs.writeFileSync(__dirname + `/frameTests/${fileNameSuffix}_16.` + CanvasType.SVG.toLowerCase(), qrCode.svg);
            done();
        }).catch(err => {
            console.error(err);
            done();
        });
    });
    it('Frame test SVG 20 characters', done => {
        const qrCodeGenerator = new QRCodeBuilder(c_20);
        qrCodeGenerator.build(CanvasType.SVG).then(qrCode => {
            fs.writeFileSync(__dirname + `/frameTests/${fileNameSuffix}_20.` + CanvasType.SVG.toLowerCase(), qrCode.svg);
            done();
        }).catch(err => {
            console.error(err);
            done();
        });
    });
    it('Frame test SVG 24 characters', done => {
        const qrCodeGenerator = new QRCodeBuilder(c_24);
        qrCodeGenerator.build(CanvasType.SVG).then(qrCode => {
            fs.writeFileSync(__dirname + `/frameTests/${fileNameSuffix}_24.` + CanvasType.SVG.toLowerCase(), qrCode.svg);
            done();
        }).catch(err => {
            console.error(err);
            done();
        });
    });
    it('Frame test SVG 27 characters', done => {
        const qrCodeGenerator = new QRCodeBuilder(c_27);
        qrCodeGenerator.build(CanvasType.SVG).then(qrCode => {
            fs.writeFileSync(__dirname + `/frameTests/${fileNameSuffix}_27.` + CanvasType.SVG.toLowerCase(), qrCode.svg);
            done();
        }).catch(err => {
            console.error(err);
            done();
        });
    });
    it('Frame test SVG 30 characters', done => {
        const qrCodeGenerator = new QRCodeBuilder(c_30);
        qrCodeGenerator.build(CanvasType.SVG).then(qrCode => {
            fs.writeFileSync(__dirname + `/frameTests/${fileNameSuffix}_30.` + CanvasType.SVG.toLowerCase(), qrCode.svg);
            done();
        }).catch(err => {
            console.error(err);
            done();
        });
    });
});
