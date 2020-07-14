import { CanvasRenderingContext2D, createCanvas, Image } from 'canvas';
import * as constants from './Constants';
import { QRMaskPattern, QRMode } from './Enums';
import { QRCode, QRPolynomial } from './Models';

export const BCH = {
    digit(data: number) {
        let digit = 0;
        while (data !== 0) {
            digit++;
            data >>>= 1;
        }
        return digit;
    },

    typeInfo(data: number) {
        let d = data << 10;
        while (this.digit(d) - this.digit(constants.G15) >= 0) {
            d ^= constants.G15 << (this.digit(d) - this.digit(constants.G15));
        }
        return ((data << 10) | d) ^ constants.G15_MASK;
    },

    typeNumber(data: number) {
        let d = data << 12;
        while (this.digit(d) - this.digit(constants.G18) >= 0) {
            d ^= constants.G18 << (this.digit(d) - this.digit(constants.G18));
        }
        return (data << 12) | d;
    },
};

class _QRMath {
    public EXP_TABLE = new Array(256);
    public LOG_TABLE = new Array(256);

    constructor() {
        let i;
        for (i = 0; i < 8; i++) {
            this.EXP_TABLE[i] = 1 << i;
        }
        for (i = 8; i < 256; i++) {
            this.EXP_TABLE[i] =
                this.EXP_TABLE[i - 4] ^ this.EXP_TABLE[i - 5] ^ this.EXP_TABLE[i - 6] ^ this.EXP_TABLE[i - 8];
        }
        for (i = 0; i < 255; i++) {
            this.LOG_TABLE[this.EXP_TABLE[i]] = i;
        }
    }

    public glog(n: number) {
        if (n < 1) {
            throw new Error('glog(' + n + ')');
        }
        return this.LOG_TABLE[n];
    }

    public gexp(n: number) {
        while (n < 0) {
            n += 255;
        }
        while (n >= 256) {
            n -= 255;
        }
        return this.EXP_TABLE[n];
    }
}

export const QRMath = new _QRMath();

export const CanvasUtil = {
    getAverageRGB(image: Image, size: number) {
        const blockSize = 5,
            defaultRGB = {
                r: 0,
                g: 0,
                b: 0,
            },
            canvas = createCanvas(size, size),
            context = canvas.getContext('2d'),
            rgb = {
                r: 0,
                g: 0,
                b: 0,
            };
        let i = -4,
            count = 0,
            data,
            width,
            height,
            length;
        if (!context) {
            return defaultRGB;
        }

        height = canvas.height = image.naturalHeight || image.height;
        width = canvas.width = image.naturalWidth || image.width;
        context.drawImage(image, 0, 0);

        try {
            data = context.getImageData(0, 0, width, height);
        } catch (e) {
            return defaultRGB;
        }

        length = data.data.length;

        while ((i += blockSize * 4) < length) {
            if (data.data[i] > 200 || data.data[i + 1] > 200 || data.data[i + 2] > 200) {
                continue;
            }
            ++count;
            rgb.r += data.data[i];
            rgb.g += data.data[i + 1];
            rgb.b += data.data[i + 2];
        }

        rgb.r = ~~(rgb.r / count);
        rgb.g = ~~(rgb.g / count);
        rgb.b = ~~(rgb.b / count);

        return rgb;
    },

    prepareRoundedCornerClip(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    },

    prepareRoundedCornerClipSVG(ctx: object, x: number, y: number, w: number, h: number, r: number) {
        // ctx.beginPath();
        // ctx.moveTo(x, y);
        // ctx.arcTo(x + w, y, x + w, y + h, r);
        // ctx.arcTo(x + w, y + h, x, y + h, r);
        // ctx.arcTo(x, y + h, x, y, r);
        // ctx.arcTo(x, y, x + w, y, r);
        // ctx.closePath();

        // TODO: prepare path using SVG.js
    },

    drawAlignProtector(
        context: CanvasRenderingContext2D,
        centerX: number,
        centerY: number,
        nWidth: number,
        nHeight: number,
    ) {
        context.clearRect((centerX - 2) * nWidth, (centerY - 2) * nHeight, 5 * nWidth, 5 * nHeight);
        context.fillRect((centerX - 2) * nWidth, (centerY - 2) * nHeight, 5 * nWidth, 5 * nHeight);
    },

    drawSVGAlignProtector(
        context: object,
        centerX: number,
        centerY: number,
        nWidth: number,
        nHeight: number,
        margin: number
    ) {
        // context.clearRect((centerX - 2) * nWidth, (centerY - 2) * nHeight, 5 * nWidth, 5 * nHeight);
        // context.fillRect((centerX - 2) * nWidth, (centerY - 2) * nHeight, 5 * nWidth, 5 * nHeight);
        // @ts-ignore
        context.rect(5 * nWidth, 5 * nHeight).fill('#ffffff').move((centerX - 2) * nWidth + margin, (centerY - 2) * nHeight + margin);
    },

    drawAlign(context: CanvasRenderingContext2D, centerX: number, centerY: number, nWidth: number, nHeight: number) {
        context.fillRect((centerX - 2) * nWidth, (centerY - 2) * nHeight, nWidth, 4 * nHeight);
        context.fillRect((centerX + 2) * nWidth, (centerY - 2 + 1) * nHeight, nWidth, 4 * nHeight);
        context.fillRect((centerX - 2 + 1) * nWidth, (centerY - 2) * nHeight, 4 * nWidth, nHeight);
        context.fillRect((centerX - 2) * nWidth, (centerY + 2) * nHeight, 4 * nWidth, nHeight);
        context.fillRect(centerX * nWidth, centerY * nHeight, nWidth, nHeight);
    },
};

export const Util = {
    getPatternPosition(typeNumber: number) {
        return constants.PATTERN_POSITION_TABLE[typeNumber - 1];
    },

    hasMask(maskPattern: number, i: number, j: number) {
        switch (maskPattern) {
            case QRMaskPattern.PATTERN000:
                return (i + j) % 2 === 0;
            case QRMaskPattern.PATTERN001:
                return i % 2 === 0;
            case QRMaskPattern.PATTERN010:
                return j % 3 === 0;
            case QRMaskPattern.PATTERN011:
                return (i + j) % 3 === 0;
            case QRMaskPattern.PATTERN100:
                return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0;
            case QRMaskPattern.PATTERN101:
                return ((i * j) % 2) + ((i * j) % 3) === 0;
            case QRMaskPattern.PATTERN110:
                return (((i * j) % 2) + ((i * j) % 3)) % 2 === 0;
            case QRMaskPattern.PATTERN111:
                return (((i * j) % 3) + ((i + j) % 2)) % 2 === 0;
            default:
                throw new Error('bad maskPattern:' + maskPattern);
        }
    },

    getErrorCorrectPolynomial(errorCorrectLength: number) {
        let a = new QRPolynomial([1], 0);
        for (let i = 0; i < errorCorrectLength; i++) {
            a = a.multiply(new QRPolynomial([1, QRMath.gexp(i)], 0));
        }
        return a;
    },

    getLengthInBits(mode: number, type: number) {
        if (1 <= type && type < 10) {
            switch (mode) {
                case QRMode.MODE_NUMBER:
                    return 10;
                case QRMode.MODE_ALPHA_NUM:
                    return 9;
                case QRMode.MODE_8BIT_BYTE:
                    return 8;
                case QRMode.MODE_KANJI:
                    return 8;
                default:
                    throw new Error('mode:' + mode);
            }
        } else if (type < 27) {
            switch (mode) {
                case QRMode.MODE_NUMBER:
                    return 12;
                case QRMode.MODE_ALPHA_NUM:
                    return 11;
                case QRMode.MODE_8BIT_BYTE:
                    return 16;
                case QRMode.MODE_KANJI:
                    return 10;
                default:
                    throw new Error('mode:' + mode);
            }
        } else if (type < 41) {
            switch (mode) {
                case QRMode.MODE_NUMBER:
                    return 14;
                case QRMode.MODE_ALPHA_NUM:
                    return 13;
                case QRMode.MODE_8BIT_BYTE:
                    return 16;
                case QRMode.MODE_KANJI:
                    return 12;
                default:
                    throw new Error('mode:' + mode);
            }
        } else {
            throw new Error('type:' + type);
        }
    },

    getLostPoint(qrCode: QRCode) {
        let row;
        let col;
        const moduleCount = qrCode.moduleCount;
        let lostPoint = 0;
        for (row = 0; row < moduleCount; row++) {
            for (col = 0; col < moduleCount; col++) {
                let sameCount = 0;
                const dark = qrCode.isDark(row, col);
                for (let r = -1; r <= 1; r++) {
                    if (row + r < 0 || moduleCount <= row + r) {
                        continue;
                    }
                    for (let c = -1; c <= 1; c++) {
                        if (col + c < 0 || moduleCount <= col + c) {
                            continue;
                        }
                        if (r === 0 && c === 0) {
                            continue;
                        }
                        if (dark === qrCode.isDark(row + r, col + c)) {
                            sameCount++;
                        }
                    }
                }
                if (sameCount > 5) {
                    lostPoint += 3 + sameCount - 5;
                }
            }
        }
        for (row = 0; row < moduleCount - 1; row++) {
            for (col = 0; col < moduleCount - 1; col++) {
                let count = 0;
                if (qrCode.isDark(row, col)) {
                    count++;
                }
                if (qrCode.isDark(row + 1, col)) {
                    count++;
                }
                if (qrCode.isDark(row, col + 1)) {
                    count++;
                }
                if (qrCode.isDark(row + 1, col + 1)) {
                    count++;
                }
                if (count === 0 || count === 4) {
                    lostPoint += 3;
                }
            }
        }
        for (row = 0; row < moduleCount; row++) {
            for (col = 0; col < moduleCount - 6; col++) {
                if (
                    qrCode.isDark(row, col) &&
                    !qrCode.isDark(row, col + 1) &&
                    qrCode.isDark(row, col + 2) &&
                    qrCode.isDark(row, col + 3) &&
                    qrCode.isDark(row, col + 4) &&
                    !qrCode.isDark(row, col + 5) &&
                    qrCode.isDark(row, col + 6)
                ) {
                    lostPoint += 40;
                }
            }
        }
        for (col = 0; col < moduleCount; col++) {
            for (row = 0; row < moduleCount - 6; row++) {
                if (
                    qrCode.isDark(row, col) &&
                    !qrCode.isDark(row + 1, col) &&
                    qrCode.isDark(row + 2, col) &&
                    qrCode.isDark(row + 3, col) &&
                    qrCode.isDark(row + 4, col) &&
                    !qrCode.isDark(row + 5, col) &&
                    qrCode.isDark(row + 6, col)
                ) {
                    lostPoint += 40;
                }
            }
        }
        let darkCount = 0;
        for (col = 0; col < moduleCount; col++) {
            for (row = 0; row < moduleCount; row++) {
                if (qrCode.isDark(row, col)) {
                    darkCount++;
                }
            }
        }
        const ratio = Math.abs((100 * darkCount) / moduleCount / moduleCount - 50) / 5;
        lostPoint += ratio * 10;
        return lostPoint;
    },
};
