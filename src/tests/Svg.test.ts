import { expect } from 'chai';
import 'mocha';
import { QRErrorCorrectLevel } from '../Enums';
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
