import { BCH, QRMath, Util, CanvasUtil } from '../Common';
import { Image } from 'canvas';
import { expect } from 'chai';
import 'mocha';

describe('BCH tests', () => {
    it('digit test', () => {
        expect(BCH.digit(869)).to.equals(10);
    });

    it('type info test', () => {
        expect(BCH.typeInfo(869)).to.equals(901333);
    });

    it('type number test', () => {
        expect(BCH.typeNumber(869)).to.equals(3560222);
    });
});

describe('QRMath tests', () => {
    it('glog tests error', () => {
        expect(() => QRMath.glog(-1)).to.throw();
    });

    it('glog tests', () => {
        expect(() => QRMath.glog(20))
            .to.not.throw()
            .to.equals(52);
    });

    it('gexp negative tests', () => {
        expect(QRMath.gexp(-10)).to.equals(233);
    });

    it('gexp tests', () => {
        expect(QRMath.gexp(300)).to.equals(193);
    });
});

describe('Util tests', () => {
    it('getPatternPosition test', () => {
        expect(Util.getPatternPosition(3)).to.eql([6, 22]);
    });

    it('hasMask test', () => {
        expect(Util.hasMask(0, 1, 1)).to.be.true;
        expect(Util.hasMask(1, 1, 1)).to.be.false;
        expect(Util.hasMask(2, 1, 1)).to.be.false;
        expect(Util.hasMask(3, 1, 1)).to.be.false;
        expect(Util.hasMask(4, 1, 1)).to.be.true;
        expect(Util.hasMask(5, 1, 1)).to.be.false;
        expect(Util.hasMask(6, 1, 1)).to.be.true;
        expect(Util.hasMask(7, 1, 1)).to.be.false;
        expect(() => Util.hasMask(8, 1, 1)).to.throw();
    });

    it('getErrorCorrectPolynomial test', () => {
        expect(Util.getErrorCorrectPolynomial(5).num).to.eql([1, 31, 198, 63, 147, 116]);
    });
});

describe('CanvasUtil tests', () => {
    it('getAverageRGB test', done => {
        const image = new Image();
        image.onload = () => {
            expect(CanvasUtil.getAverageRGB(image, 100)).to.eql({ b: 4, g: 10, r: 16 });
            return done();
        };
        image.onerror = err => {
            return done(err);
        };
        image.src = __dirname + '/pokemon.png';
    });
});
