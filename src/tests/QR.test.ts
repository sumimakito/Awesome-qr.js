import { expect } from 'chai';
import 'mocha';
import { CanvasType, DataPattern, EyeBallShape, EyeFrameShape, GradientType, QRCodeFrame, QRErrorCorrectLevel } from '../Enums';
import { QRCodeBuilder } from '../index';
import { QRCode } from '../Models';

// tslint:disable-next-line:no-var-requires
const fs =  require('fs');

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
    logoImage: 'https://www.tutorialspoint.com/videotutorials/images/coding_ground_home.jpg',
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
const config13 = {
    text: vCardSampleData,
    logoImage: 'https://www.tutorialspoint.com/videotutorials/images/coding_ground_home.jpg',
    logoBackground: false,
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

const configCase2 = {
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
const configCase3 = {
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

const configCase4 = {
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
const configCase5 = {
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
const configCase6 = {
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
const configCase7 = {
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
const configCase8 = {
    canvasType: CanvasType.SVG,
    backgroundColor:'white',
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
const configCase9 = {
    canvasType: CanvasType.SVG,
    backgroundColor:'white',
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
const configCase10 = {
    canvasType: CanvasType.SVG,
    colorDark: "red",
    backgroundColor:'white',
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


const configCasePNG = {
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
const configCasePNG2 = {
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
const configCasePNG3 = {
    text: 'https://www.beaconstac.com',
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
const configCasePNG4 = {
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
const configCasePNG5 = {
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
const configCasePNG6 = {
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
const configCasePNG7 = {
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
const configCasePNG8 = {
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

const configCasePNG9 = {
    backgroundColor:'white',
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
const configCasePNG10 = {
    canvasType: CanvasType.SVG,
    backgroundColor:'white',
    colorDark: "blue",
    colorLight: "green",
    dataPattern: DataPattern.CIRCLE,
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
const configCasePNG11 = {
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
const configCasePNG12 = {
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
  //  gradientType: GradientType.VERTICAL,
   // imageServerURL: "https://beaconstacqa.mobstac.com/api/2.0/validate_url/",

    text: "https://google.com",
};
const configCasePNG13 = {
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
const configCasePNG14 = {
    text: sampleUrl,
    logoImage: 'https://www.tutorialspoint.com/videotutorials/images/coding_ground_home.jpg',  
    logoBackground: false,
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
    it('QR test SVG: frame-plus-square', done => {
        const qrCodeGenerator = new QRCodeBuilder(config13);

        qrCodeGenerator.build(CanvasType.SVG).then(qrCode => {
            fs.writeFileSync(__dirname + '/qrTests/logo_no_background.' + CanvasType.SVG.toLowerCase(), qrCode.toBuffer());
            done();
        }).catch(err => {
            console.error(err);
            done();
        });
    });
    it('Main test SVG 2', done => {
        const qrCodeGenerator = new QRCodeBuilder(configCase2);
        qrCodeGenerator.build(CanvasType.SVG).then(qrCode => {
            
            fs.writeFileSync(__dirname + '/qrTests/default-svg2.' + CanvasType.SVG.toLowerCase(), qrCode.toBuffer());
            done();
        }).catch(err => {
           console.error(err);
            done();
        });
    });
    it('Main test SVG 3', done => {
        const qrCodeGenerator = new QRCodeBuilder(configCase3);
    
        qrCodeGenerator.build(CanvasType.SVG).then(qrCode => {
            
            fs.writeFileSync(__dirname + '/qrTests/default-svg3.' + CanvasType.SVG.toLowerCase(), qrCode.toBuffer());
            done();
        }).catch(err => {
           console.error(err);
            done();
        });
    });
    it('Main test SVG 4', done => {
        const qrCodeGenerator = new QRCodeBuilder(configCase4);
    
        qrCodeGenerator.build(CanvasType.SVG).then(qrCode => {
            
            fs.writeFileSync(__dirname + '/qrTests/default-svg4.' + CanvasType.SVG.toLowerCase(), qrCode.toBuffer());
            done();
        }).catch(err => {
           console.error(err);
            done();
        });
    });
    it('Main test SVG 5', done => {
        const qrCodeGenerator = new QRCodeBuilder(configCase5);
    
        qrCodeGenerator.build(CanvasType.SVG).then(qrCode => {
            
            fs.writeFileSync(__dirname + '/qrTests/default-svg5.' + CanvasType.SVG.toLowerCase(), qrCode.toBuffer());
            done();
        }).catch(err => {
           console.error(err);
            done();
        });
    });
    it('Main test SVG 6 circular', done => {
        const qrCodeGenerator = new QRCodeBuilder(configCase6);
    
        qrCodeGenerator.build(CanvasType.SVG).then(qrCode => {
            
            fs.writeFileSync(__dirname + '/qrTests/circular-kite.' + CanvasType.SVG.toLowerCase(), qrCode.toBuffer());
            done();
        }).catch(err => {
           console.error(err);
            done();
        });
    });
    it('Main test SVG 7 circular with large text', done => {
        const qrCodeGenerator = new QRCodeBuilder(configCase7);
    
        qrCodeGenerator.build(CanvasType.SVG).then(qrCode => {
            
            fs.writeFileSync(__dirname + '/qrTests/circular-circle.' + CanvasType.SVG.toLowerCase(), qrCode.toBuffer());
            done();
        }).catch(err => {
           console.error(err);
            done();
        });
    });
    it('Main test SVG 8 circular', done => {
        const qrCodeGenerator = new QRCodeBuilder(configCase8);
    
        qrCodeGenerator.build(CanvasType.SVG).then(qrCode => {
            
            fs.writeFileSync(__dirname + '/qrTests/circular-leftdiamond.' + CanvasType.SVG.toLowerCase(), qrCode.toBuffer());
            done();
        }).catch(err => {
           console.error(err);
            done();
        });
    });
    it('Main test SVG 9 circular', done => {
        const qrCodeGenerator = new QRCodeBuilder(configCase9);
    
        qrCodeGenerator.build(CanvasType.SVG).then(qrCode => {
            
            fs.writeFileSync(__dirname + '/qrTests/circular-rightdiamond.' + CanvasType.SVG.toLowerCase(), qrCode.toBuffer());
            done();
        }).catch(err => {
           console.error(err);
            done();
        });
    });
    it('Main test SVG 10 circular', done => {
        const qrCodeGenerator = new QRCodeBuilder(configCase10);
    
        qrCodeGenerator.build(CanvasType.SVG).then(qrCode => {
            
            fs.writeFileSync(__dirname + '/qrTests/circular-sqaure.' + CanvasType.SVG.toLowerCase(), qrCode.toBuffer());
            done();
        }).catch(err => {
           console.error(err);
            done();
        });
    });
    it('Main test QR 1', done => {
        const qrCodeGenerator = new QRCodeBuilder(configCasePNG);
        qrCodeGenerator.build(CanvasType.PNG).then(qrCode => {
            const bufferObject = prepareImageBuffer(qrCode, 'defualt-test');
            fs.writeFileSync(__dirname + bufferObject.name, bufferObject.buffer);
            done();
        }).catch(err => {
            console.error(err);
            done();
        });
    });
    it('Main test QR 2', done => {
        const qrCodeGenerator = new QRCodeBuilder(configCasePNG2);
        qrCodeGenerator.build(CanvasType.PNG).then(qrCode => {
            const bufferObject = prepareImageBuffer(qrCode, 'defualt-test2');
            fs.writeFileSync(__dirname + bufferObject.name, bufferObject.buffer);
            done();
        }).catch(err => {
            console.error(err);
            done();
        });
    });
    it('Main test QR 3', done => {
        const qrCodeGenerator = new QRCodeBuilder(configCasePNG3);
        qrCodeGenerator.build(CanvasType.PNG).then(qrCode => {
            const bufferObject = prepareImageBuffer(qrCode, 'defualt-test3');
            fs.writeFileSync(__dirname + bufferObject.name, bufferObject.buffer);
            done();
        }).catch(err => {
            console.error(err);
            done();
        });
    });
    it('Main test QR 4', done => {
        const qrCodeGenerator = new QRCodeBuilder(configCasePNG4);
        qrCodeGenerator.build(CanvasType.PNG).then(qrCode => {
            const bufferObject = prepareImageBuffer(qrCode, 'defualt-test4');
            fs.writeFileSync(__dirname + bufferObject.name, bufferObject.buffer);
            done();
        }).catch(err => {
            console.error(err);
            done();
        });
    });
    it('Main test QR 5', done => {
        const qrCodeGenerator = new QRCodeBuilder(configCasePNG5);
        qrCodeGenerator.build(CanvasType.PNG).then(qrCode => {
            const bufferObject = prepareImageBuffer(qrCode, 'defualt-test5');
            fs.writeFileSync(__dirname + bufferObject.name, bufferObject.buffer);
            done();
        }).catch(err => {
            console.error(err);
            done();
        });
    });
    it('Main test QR 6', done => {
        const qrCodeGenerator = new QRCodeBuilder(configCasePNG6);
        qrCodeGenerator.build(CanvasType.PNG).then(qrCode => {
            const bufferObject = prepareImageBuffer(qrCode, 'defualt-test6');
            fs.writeFileSync(__dirname + bufferObject.name, bufferObject.buffer);
            done();
        }).catch(err => {
            console.error(err);
            done();
        });
    });
    it('Main test QR 7', done => {
        const qrCodeGenerator = new QRCodeBuilder(configCasePNG7);
        qrCodeGenerator.build(CanvasType.PNG).then(qrCode => {
            const bufferObject = prepareImageBuffer(qrCode, 'defualt-test7');
            fs.writeFileSync(__dirname + bufferObject.name, bufferObject.buffer);
            done();
        }).catch(err => {
            console.error(err);
            done();
        });
    });
    it('Main test QR 8 very large text', done => {
        const qrCodeGenerator = new QRCodeBuilder(configCasePNG8);
        qrCodeGenerator.build(CanvasType.PNG).then(qrCode => {
            const bufferObject = prepareImageBuffer(qrCode, 'defualt-test8');
            fs.writeFileSync(__dirname + bufferObject.name, bufferObject.buffer);
            done();
        }).catch(err => {
            console.error(err);
            done();
        });
    });
    it('Main test QR 9 circular', done => {
        const qrCodeGenerator = new QRCodeBuilder(configCasePNG9);
        qrCodeGenerator.build(CanvasType.PNG).then(qrCode => {
            const bufferObject = prepareImageBuffer(qrCode, 'circular-kite');
            fs.writeFileSync(__dirname + bufferObject.name, bufferObject.buffer);
            done();
        }).catch(err => {
            console.error(err);
            done();
        });
    });
    it('Main test QR 10 circular', done => {
        const qrCodeGenerator = new QRCodeBuilder(configCasePNG10);
        qrCodeGenerator.build(CanvasType.PNG).then(qrCode => {
            const bufferObject = prepareImageBuffer(qrCode, 'circular-circle');
            fs.writeFileSync(__dirname + bufferObject.name, bufferObject.buffer);
            done();
        }).catch(err => {
            console.error(err);
            done();
        });
    });
    it('Main test QR 11 circular', done => {
        const qrCodeGenerator = new QRCodeBuilder(configCasePNG11);
        qrCodeGenerator.build(CanvasType.PNG).then(qrCode => {
            const bufferObject = prepareImageBuffer(qrCode, 'circular-leftdiamond');
            fs.writeFileSync(__dirname + bufferObject.name, bufferObject.buffer);
            done();
        }).catch(err => {
            console.error(err);
            done();
        });
    });
    it('Main test QR 12 circular', done => {
        const qrCodeGenerator = new QRCodeBuilder(configCasePNG12);
        qrCodeGenerator.build(CanvasType.PNG).then(qrCode => {
            const bufferObject = prepareImageBuffer(qrCode, 'circular-rightdiamond');
            fs.writeFileSync(__dirname + bufferObject.name, bufferObject.buffer);
            done();
        }).catch(err => {
            console.error(err);
            done();
        });
        
    });
    it('Main test QR 13 circular', done => {
        const qrCodeGenerator = new QRCodeBuilder(configCasePNG13);
        qrCodeGenerator.build(CanvasType.PNG).then(qrCode => {
            const bufferObject = prepareImageBuffer(qrCode, 'circular-square');
            fs.writeFileSync(__dirname + bufferObject.name, bufferObject.buffer);
            done();
        }).catch(err => {
            console.error(err);
            done();
        });
    });
    
    it('Main test QR 14 circular_no_logo_background', done => {
        const qrCodeGenerator = new QRCodeBuilder(configCasePNG14);
        qrCodeGenerator.build(CanvasType.PNG).then(qrCode => {
            const bufferObject = prepareImageBuffer(qrCode, 'circular_png_no_logo_background');
            fs.writeFileSync(__dirname + bufferObject.name, bufferObject.buffer);
            done();
        }).catch(err => {
            console.error(err);
            done();
        });
    });
});





