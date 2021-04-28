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
    // backgroundImage: 'https://image.flaticon.com/teams/slug/google.jpg',
    // backgroundImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjEyMDd9',
    backgroundImage: 'https://s3.amazonaws.com/beaconstac-content-qa/1593/9653e5dae58849b9bf523e27142f875e',
    // backgroundImage: 'https://d1bqobzsowu5wu.cloudfront.net/26724/14310bbf5eac4f608280a5c5a2b2b5a0',
    // backgroundImage: 'https://cdn.pixabay.com/photo/2019/09/29/22/06/light-bulb-4514505_1280.jpg',
    // backgroundImage: 'https://cdn.pixabay.com/photo/2016/07/12/19/51/americana-1512910_1280.png',
    backgroundColor: '#000000',
    // logoImage: 'https://s3.amazonaws.com/beaconstac-content-qa/1529/cfdb6d40c166494293763baab96007f3',
    // logoImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Blue_circle_logo.svg/1200px-Blue_circle_logo.svg.png',
    // logoImage: 'https://static.beaconstac.com/assets/img/qr-code-logos/play-store.svg',
    // logoImage: 'https://static.beaconstac.com/assets/img/qr-code-logos/app-store.svg',
    // logoImage: 'https://static.beaconstac.com/assets/img/qr-code-logos/calender.svg',
    // logoImage: 'https://svgsilh.com/svg/1801287.svg',
    // logoImage: 'https://svgsilh.com/svg/1295198.svg',
    // logoImage: 'https://svgsilh.com/svg/2103623.svg',
    logoImage: 'https://static.beaconstac.com/assets/img/qr-code-logos/email.svg',
    // logoImage: 'https://static.beaconstac.com/assets/img/qr-code-logos/covid-logo-1.svg',
    // logoImage: 'https://static.beaconstac.com/assets/img/qr-code-logos/covid-logo-6.svg',
    // logoImage: 'https://static.beaconstac.com/assets/img/qr-code-logos/instagram.svg',
    // logoImage: 'https://www.flaticon.com/svg/static/icons/svg/244/244812.svg',
    // logoImage: 'https://www.flaticon.com/svg/static/icons/svg/1182/1182686.svg',
    // logoImage: 'https://www.flaticon.com/svg/static/icons/svg/3500/3500314.svg',
    // logoImage: __dirname + '/tests/phone-receiver.' + CanvasType.SVG.toLowerCase(),
    // logoImage: 'https://s3.amazonaws.com/beaconstac-content-qa/1593/930997b9951845639b3d4f33a3580026',
    // logoImage: 'https://cdn.worldvectorlogo.com/logos/nike-4.svg',
    // logoImage: 'https://cdn.worldvectorlogo.com/logos/puma-2.svg',
    // logoImage: 'https://cdn.worldvectorlogo.com/logos/mastercard-2.svg',
    // logoImage: 'https://cdn.worldvectorlogo.com/logos/audi-13.svg',
    // logoImage: 'https://cdn.worldvectorlogo.com/logos/tesla-3.svg',
    // logoImage: 'https://cdn.worldvectorlogo.com/logos/whatsapp-icon.svg',
    // logoImage: 'https://cdn.worldvectorlogo.com/logos/whatsapp-icon.svg',
    // logoImage: 'https://cdn.worldvectorlogo.com/logos/angular-icon-1.svg',
    // logoImage: 'https://cdn.worldvectorlogo.com/logos/johnny-bravo-2.svg',
    // logoImage: 'https://cdn.worldvectorlogo.com/logos/nasa-6.svg',
    // logoImage: 'https://www.flaticon.com/svg/static/icons/svg/1829/1829070.svg',
    // logoImage: 'https://s.cdpn.io/3/kiwi.svg',
    // logoImage: 'https://s3.amazonaws.com/beaconstac-content-qa/1860/c750e51065284afd97714bad7310b0ea',
    canvasType: CanvasType.SVG,
    eyeFrameShape: EyeFrameShape.ROUNDED,
    eyeBallShape: EyeBallShape.ROUNDED,
    // eyeFrameColor: '#287314',
    // eyeBallColor: '#234',
    // dataPattern: DataPattern.KITE,
    colorDark: '#376dd3',
    colorLight: '#4494fc',
    dotScale: 1,
    gradientType: GradientType.VERTICAL,
    // frameStyle: QRCodeFrame.BALLOON_BOTTOM,
    frameColor: '#0b1257',
    // frameText: 'HEY QR',
    // logoMargin: 10,
    // logoScale: 0.25,
    // margin: 80,
    size: 2048,
    isVCard: false,
    useCanvas: false,
    useOpacity: true,
    correctLevel: QRErrorCorrectLevel.H
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
