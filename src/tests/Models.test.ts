import { expect } from 'chai';
import 'mocha';
import { QRErrorCorrectLevel } from '../Enums';
import { QR8bitByte, QRCode, QRPolynomial } from '../Models';


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
        const qrCode = new QRCode(-1, QRErrorCorrectLevel.M);
        qrCode.addData('test');
        qrCode.make();
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
