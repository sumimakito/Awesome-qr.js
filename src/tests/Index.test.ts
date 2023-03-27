import { Gradient } from '@svgdotjs/svg.js';
import 'mocha';
import { CanvasType, DataPattern, EyeBallShape, EyeFrameShape, GradientType, QRCodeFrame, QRErrorCorrectLevel } from '../Enums';
import { QRCodeBuilder } from '../index';
import { QRCode } from '../Models';
const sharp = require("sharp")

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
EMAIL:demo@mobstac.com
ADR;TYPE=WORK:;;eafe, thgsh;Bangalore;KA;560008;India
URL:mobstac.com
REV:2008-04-24T19:52:43Z
END:VCARD`;

const config = {
    // text: vCardSampleData,
    text: "https://qr.beaconstac.com/qwertyp",
    logoBackground: false,
    backgroundColor: "#ffff00",
    // backgroundColor: "rgba(255,255,255,0)",
    canvasType: CanvasType.SVG,
    dataPattern: DataPattern.SQUARE,
    dotScale: 1,
    colorDark: "#000000",
    colorLight : '#00FFFF',
    eyeBallShape: EyeBallShape.ROUNDED,
    eyeFrameShape: EyeFrameShape.ROUNDED,
    eyeFrameColor : '#000000',
    eyeBallColor : '#000000',
    frameStyle: QRCodeFrame.NONE,
    frameText: "SCAN ME",
    frameColor: "#724DDB",
    frameTextColor: "#FFFFFF",
    gradientType: GradientType.NONE,
    logoScale: 0.24,
    backgroundImage :'https://media.sproutsocial.com/uploads/2017/02/10x-featured-social-media-image-size.png',
    logoImage : 'https://d1bqobzsowu5wu.cloudfront.net/26724/82f44894b6d84815b43b754b17189333',
    size: 512,
    margin: 40,
    correctLevel: QRErrorCorrectLevel.Q,
    // isVCard : true

};


describe('QR code main tests', () => {
    it('QR main test SVG', done => {
        const qrCodeGenerator = new QRCodeBuilder(config);

        qrCodeGenerator.build(CanvasType.SVG).then(async qrCode => {
            await fs.writeFileSync(__dirname + '/test.' + CanvasType.SVG.toLowerCase(), qrCode.svg);
            let jpeg  = await sharp(__dirname + '/test.svg').toFile(__dirname + '/test.jpeg' );
            // console.log(jpeg)
            await sharp(__dirname + '/test.svg').toFile(__dirname + '/test.png' );
            // console.log(jpeg)
            done();
        }).catch(err => {
            console.error(err);
            done();
        });
    });
});
