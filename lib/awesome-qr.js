"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AwesomeQR = void 0;
var skia_canvas_1 = require("skia-canvas");
var gifuct_js_1 = require("./gifuct-js");
var qrcode_1 = require("./qrcode");
var GIFEncoder_1 = __importDefault(require("./gif.js/GIFEncoder"));
var defaultScale = 0.4;
var AwesomeQR = /** @class */ (function () {
    function AwesomeQR(options) {
        var _options = Object.assign({}, options);
        Object.keys(AwesomeQR.defaultOptions).forEach(function (k) {
            if (!(k in _options)) {
                Object.defineProperty(_options, k, { value: AwesomeQR.defaultOptions[k], enumerable: true, writable: true });
            }
        });
        if (!_options.components) {
            _options.components = AwesomeQR.defaultComponentOptions;
        }
        else if (typeof _options.components === "object") {
            Object.keys(AwesomeQR.defaultComponentOptions).forEach(function (k) {
                if (!(k in _options.components)) {
                    Object.defineProperty(_options.components, k, {
                        value: AwesomeQR.defaultComponentOptions[k],
                        enumerable: true,
                        writable: true,
                    });
                }
                else {
                    Object.defineProperty(_options.components, k, {
                        value: __assign(__assign({}, AwesomeQR.defaultComponentOptions[k]), _options.components[k]),
                        enumerable: true,
                        writable: true,
                    });
                }
            });
        }
        if (_options.dotScale !== null && _options.dotScale !== undefined) {
            if (_options.dotScale <= 0 || _options.dotScale > 1) {
                throw new Error("dotScale should be in range (0, 1].");
            }
            _options.components.data.scale = _options.dotScale;
            _options.components.timing.scale = _options.dotScale;
            _options.components.alignment.scale = _options.dotScale;
        }
        this.options = _options;
        this.canvas = new skia_canvas_1.Canvas(options.size, options.size);
        this.canvasContext = this.canvas.getContext("2d");
        this.qrCode = new qrcode_1.QRCodeModel(-1, this.options.correctLevel);
        if (Number.isInteger(this.options.maskPattern)) {
            this.qrCode.maskPattern = this.options.maskPattern;
        }
        if (Number.isInteger(this.options.version)) {
            this.qrCode.typeNumber = this.options.version;
        }
        this.qrCode.addData(this.options.text);
        this.qrCode.make();
    }
    AwesomeQR.prototype.draw = function () {
        var _this = this;
        return new Promise(function (resolve) { return _this._draw().then(resolve); });
    };
    AwesomeQR.prototype._clear = function () {
        this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
    };
    AwesomeQR._prepareRoundedCornerClip = function (canvasContext, x, y, w, h, r) {
        canvasContext.beginPath();
        canvasContext.moveTo(x, y);
        canvasContext.arcTo(x + w, y, x + w, y + h, r);
        canvasContext.arcTo(x + w, y + h, x, y + h, r);
        canvasContext.arcTo(x, y + h, x, y, r);
        canvasContext.arcTo(x, y, x + w, y, r);
        canvasContext.closePath();
    };
    AwesomeQR._getAverageRGB = function (image) {
        var blockSize = 5;
        var defaultRGB = {
            r: 0,
            g: 0,
            b: 0,
        };
        var width, height;
        var i = -4;
        var rgb = {
            r: 0,
            g: 0,
            b: 0,
        };
        var count = 0;
        height = image.naturalHeight || image.height;
        width = image.naturalWidth || image.width;
        var canvas = new skia_canvas_1.Canvas(width, height);
        var context = canvas.getContext("2d");
        if (!context) {
            return defaultRGB;
        }
        context.drawImage(image, 0, 0);
        var data;
        try {
            data = context.getImageData(0, 0, width, height);
        }
        catch (e) {
            return defaultRGB;
        }
        while ((i += blockSize * 4) < data.data.length) {
            if (data.data[i] > 200 || data.data[i + 1] > 200 || data.data[i + 2] > 200)
                continue;
            ++count;
            rgb.r += data.data[i];
            rgb.g += data.data[i + 1];
            rgb.b += data.data[i + 2];
        }
        rgb.r = ~~(rgb.r / count);
        rgb.g = ~~(rgb.g / count);
        rgb.b = ~~(rgb.b / count);
        return rgb;
    };
    AwesomeQR._drawDot = function (canvasContext, centerX, centerY, nSize, xyOffset, dotScale) {
        if (xyOffset === void 0) { xyOffset = 0; }
        if (dotScale === void 0) { dotScale = 1; }
        canvasContext.fillRect((centerX + xyOffset) * nSize, (centerY + xyOffset) * nSize, dotScale * nSize, dotScale * nSize);
    };
    AwesomeQR._drawAlignProtector = function (canvasContext, centerX, centerY, nSize) {
        canvasContext.clearRect((centerX - 2) * nSize, (centerY - 2) * nSize, 5 * nSize, 5 * nSize);
        canvasContext.fillRect((centerX - 2) * nSize, (centerY - 2) * nSize, 5 * nSize, 5 * nSize);
    };
    AwesomeQR._drawAlign = function (canvasContext, centerX, centerY, nSize, xyOffset, dotScale, colorDark, hasProtector) {
        if (xyOffset === void 0) { xyOffset = 0; }
        if (dotScale === void 0) { dotScale = 1; }
        var oldFillStyle = canvasContext.fillStyle;
        canvasContext.fillStyle = colorDark;
        new Array(4).fill(0).map(function (_, i) {
            AwesomeQR._drawDot(canvasContext, centerX - 2 + i, centerY - 2, nSize, xyOffset, dotScale);
            AwesomeQR._drawDot(canvasContext, centerX + 2, centerY - 2 + i, nSize, xyOffset, dotScale);
            AwesomeQR._drawDot(canvasContext, centerX + 2 - i, centerY + 2, nSize, xyOffset, dotScale);
            AwesomeQR._drawDot(canvasContext, centerX - 2, centerY + 2 - i, nSize, xyOffset, dotScale);
        });
        AwesomeQR._drawDot(canvasContext, centerX, centerY, nSize, xyOffset, dotScale);
        if (!hasProtector) {
            canvasContext.fillStyle = "rgba(255, 255, 255, 0.6)";
            new Array(2).fill(0).map(function (_, i) {
                AwesomeQR._drawDot(canvasContext, centerX - 1 + i, centerY - 1, nSize, xyOffset, dotScale);
                AwesomeQR._drawDot(canvasContext, centerX + 1, centerY - 1 + i, nSize, xyOffset, dotScale);
                AwesomeQR._drawDot(canvasContext, centerX + 1 - i, centerY + 1, nSize, xyOffset, dotScale);
                AwesomeQR._drawDot(canvasContext, centerX - 1, centerY + 1 - i, nSize, xyOffset, dotScale);
            });
        }
        canvasContext.fillStyle = oldFillStyle;
    };
    AwesomeQR.prototype._draw = function () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u;
        return __awaiter(this, void 0, void 0, function () {
            var nCount, rawSize, rawMargin, file, margin, rawViewportSize, whiteMargin, backgroundDimming, nSize, viewportSize, size, mainCanvas, mainCanvasContext, backgroundCanvas, backgroundCanvasContext, parsedGIFBackground, gifFrames, gif, r, g, b, count, i, c, backgroundImage, avgRGB, alignmentPatternCenters, dataScale, dataXyOffset, row, col, bIsDark, isBlkPosCtr, isTiming, isProtected, i, nLeft, nTop, inAgnRange, cornerAlignmentCenter, protectorStyle, i, j, agnX, agnY, timingScale, timingXyOffset, i, cornerAlignmentScale, cornerAlignmentXyOffset, alignmentScale, alignmentXyOffset, i, j, agnX, agnY, logoImage, logoScale, logoMargin, logoCornerRadius, logoSize, x, y, oldGlobalCompositeOperation, gifOutput_1, backgroundCanvas_1, backgroundCanvasContext_1, patchCanvas_1, patchCanvasContext_1, patchData_1, u8array, binary, outCanvas, outCanvasContext, format;
            return __generator(this, function (_v) {
                switch (_v.label) {
                    case 0:
                        nCount = (_a = this.qrCode) === null || _a === void 0 ? void 0 : _a.moduleCount;
                        rawSize = this.options.size;
                        rawMargin = this.options.margin;
                        file = this.options.file || 'png';
                        if (rawMargin < 0 || rawMargin * 2 >= rawSize) {
                            rawMargin = 0;
                        }
                        margin = Math.ceil(rawMargin);
                        rawViewportSize = rawSize - 2 * rawMargin;
                        whiteMargin = this.options.whiteMargin;
                        backgroundDimming = this.options.backgroundDimming;
                        nSize = Math.ceil(rawViewportSize / nCount);
                        viewportSize = nSize * nCount;
                        size = viewportSize + 2 * margin;
                        mainCanvas = new skia_canvas_1.Canvas(size, size);
                        mainCanvasContext = mainCanvas.getContext("2d");
                        this._clear();
                        // Translate to make the top and left margins off the viewport
                        mainCanvasContext.save();
                        mainCanvasContext.translate(margin, margin);
                        backgroundCanvas = new skia_canvas_1.Canvas(size, size);
                        backgroundCanvasContext = backgroundCanvas.getContext("2d");
                        parsedGIFBackground = null;
                        gifFrames = [];
                        console.log('Print Info', nCount, rawSize, nSize, rawViewportSize, size);
                        if (!!!this.options.gifBackground) return [3 /*break*/, 1];
                        gif = (0, gifuct_js_1.parseGIF)(this.options.gifBackground);
                        parsedGIFBackground = gif;
                        gifFrames = (0, gifuct_js_1.decompressFrames)(gif, true);
                        if (this.options.autoColor) {
                            r = 0, g = 0, b = 0;
                            count = 0;
                            for (i = 0; i < gifFrames[0].colorTable.length; i++) {
                                c = gifFrames[0].colorTable[i];
                                if (c[0] > 200 || c[1] > 200 || c[2] > 200)
                                    continue;
                                if (c[0] === 0 && c[1] === 0 && c[2] === 0)
                                    continue;
                                count++;
                                r += c[0];
                                g += c[1];
                                b += c[2];
                            }
                            r = ~~(r / count);
                            g = ~~(g / count);
                            b = ~~(b / count);
                            this.options.colorDark = "rgb(".concat(r, ",").concat(g, ",").concat(b, ")");
                        }
                        return [3 /*break*/, 4];
                    case 1:
                        if (!!!this.options.backgroundImage) return [3 /*break*/, 3];
                        return [4 /*yield*/, (0, skia_canvas_1.loadImage)(this.options.backgroundImage)];
                    case 2:
                        backgroundImage = _v.sent();
                        if (this.options.autoColor) {
                            avgRGB = AwesomeQR._getAverageRGB(backgroundImage);
                            this.options.colorDark = "rgb(".concat(avgRGB.r, ",").concat(avgRGB.g, ",").concat(avgRGB.b, ")");
                        }
                        backgroundCanvasContext.drawImage(backgroundImage, 0, 0, backgroundImage.width, backgroundImage.height, 0, 0, size, size);
                        backgroundCanvasContext.rect(0, 0, size, size);
                        backgroundCanvasContext.fillStyle = backgroundDimming;
                        backgroundCanvasContext.fill();
                        return [3 /*break*/, 4];
                    case 3:
                        backgroundCanvasContext.rect(0, 0, size, size);
                        backgroundCanvasContext.fillStyle = this.options.colorLight;
                        backgroundCanvasContext.fill();
                        _v.label = 4;
                    case 4:
                        alignmentPatternCenters = qrcode_1.QRUtil.getPatternPosition(this.qrCode.typeNumber);
                        dataScale = ((_c = (_b = this.options.components) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.scale) || defaultScale;
                        dataXyOffset = (1 - dataScale) * 0.5;
                        for (row = 0; row < nCount; row++) {
                            for (col = 0; col < nCount; col++) {
                                bIsDark = this.qrCode.isDark(row, col);
                                isBlkPosCtr = (col < 8 && (row < 8 || row >= nCount - 8)) || (col >= nCount - 8 && row < 8);
                                isTiming = (row == 6 && col >= 8 && col <= nCount - 8) || (col == 6 && row >= 8 && row <= nCount - 8);
                                isProtected = isBlkPosCtr || isTiming;
                                for (i = 1; i < alignmentPatternCenters.length - 1; i++) {
                                    isProtected =
                                        isProtected ||
                                            (row >= alignmentPatternCenters[i] - 2 &&
                                                row <= alignmentPatternCenters[i] + 2 &&
                                                col >= alignmentPatternCenters[i] - 2 &&
                                                col <= alignmentPatternCenters[i] + 2);
                                }
                                nLeft = col * nSize + (isProtected ? 0 : dataXyOffset * nSize);
                                nTop = row * nSize + (isProtected ? 0 : dataXyOffset * nSize);
                                mainCanvasContext.strokeStyle = bIsDark ? this.options.colorDark : this.options.colorLight;
                                mainCanvasContext.lineWidth = 0.5;
                                mainCanvasContext.fillStyle = bIsDark ? this.options.colorDark : "rgba(255, 255, 255, 0.6)";
                                if (alignmentPatternCenters.length === 0) {
                                    if (!isProtected) {
                                        mainCanvasContext.fillRect(nLeft, nTop, (isProtected ? (isBlkPosCtr ? 1 : 1) : dataScale) * nSize, (isProtected ? (isBlkPosCtr ? 1 : 1) : dataScale) * nSize);
                                    }
                                }
                                else {
                                    inAgnRange = col < nCount - 4 && col >= nCount - 4 - 5 && row < nCount - 4 && row >= nCount - 4 - 5;
                                    if (!isProtected && !inAgnRange) {
                                        // if align pattern list is empty, then it means that we don't need to leave room for the align patterns
                                        mainCanvasContext.fillRect(nLeft, nTop, (isProtected ? (isBlkPosCtr ? 1 : 1) : dataScale) * nSize, (isProtected ? (isBlkPosCtr ? 1 : 1) : dataScale) * nSize);
                                    }
                                }
                            }
                        }
                        cornerAlignmentCenter = alignmentPatternCenters[alignmentPatternCenters.length - 1];
                        protectorStyle = "rgba(255, 255, 255, 0.6)";
                        // - FINDER PROTECTORS
                        mainCanvasContext.fillStyle = protectorStyle;
                        mainCanvasContext.fillRect(0, 0, 8 * nSize, 8 * nSize);
                        mainCanvasContext.fillRect(0, (nCount - 8) * nSize, 8 * nSize, 8 * nSize);
                        mainCanvasContext.fillRect((nCount - 8) * nSize, 0, 8 * nSize, 8 * nSize);
                        // - TIMING PROTECTORS
                        if ((_e = (_d = this.options.components) === null || _d === void 0 ? void 0 : _d.timing) === null || _e === void 0 ? void 0 : _e.protectors) {
                            mainCanvasContext.fillRect(8 * nSize, 6 * nSize, (nCount - 8 - 8) * nSize, nSize);
                            mainCanvasContext.fillRect(6 * nSize, 8 * nSize, nSize, (nCount - 8 - 8) * nSize);
                        }
                        // - CORNER ALIGNMENT PROTECTORS
                        if ((_g = (_f = this.options.components) === null || _f === void 0 ? void 0 : _f.cornerAlignment) === null || _g === void 0 ? void 0 : _g.protectors) {
                            AwesomeQR._drawAlignProtector(mainCanvasContext, cornerAlignmentCenter, cornerAlignmentCenter, nSize);
                        }
                        // - ALIGNMENT PROTECTORS
                        if ((_j = (_h = this.options.components) === null || _h === void 0 ? void 0 : _h.alignment) === null || _j === void 0 ? void 0 : _j.protectors) {
                            for (i = 0; i < alignmentPatternCenters.length; i++) {
                                for (j = 0; j < alignmentPatternCenters.length; j++) {
                                    agnX = alignmentPatternCenters[j];
                                    agnY = alignmentPatternCenters[i];
                                    if (agnX === 6 && (agnY === 6 || agnY === cornerAlignmentCenter)) {
                                        continue;
                                    }
                                    else if (agnY === 6 && (agnX === 6 || agnX === cornerAlignmentCenter)) {
                                        continue;
                                    }
                                    else if (agnX === cornerAlignmentCenter && agnY === cornerAlignmentCenter) {
                                        continue;
                                    }
                                    else {
                                        AwesomeQR._drawAlignProtector(mainCanvasContext, agnX, agnY, nSize);
                                    }
                                }
                            }
                        }
                        // - FINDER
                        mainCanvasContext.fillStyle = this.options.colorDark;
                        mainCanvasContext.fillRect(0, 0, 7 * nSize, nSize);
                        mainCanvasContext.fillRect((nCount - 7) * nSize, 0, 7 * nSize, nSize);
                        mainCanvasContext.fillRect(0, 6 * nSize, 7 * nSize, nSize);
                        mainCanvasContext.fillRect((nCount - 7) * nSize, 6 * nSize, 7 * nSize, nSize);
                        mainCanvasContext.fillRect(0, (nCount - 7) * nSize, 7 * nSize, nSize);
                        mainCanvasContext.fillRect(0, (nCount - 7 + 6) * nSize, 7 * nSize, nSize);
                        mainCanvasContext.fillRect(0, 0, nSize, 7 * nSize);
                        mainCanvasContext.fillRect(6 * nSize, 0, nSize, 7 * nSize);
                        mainCanvasContext.fillRect((nCount - 7) * nSize, 0, nSize, 7 * nSize);
                        mainCanvasContext.fillRect((nCount - 7 + 6) * nSize, 0, nSize, 7 * nSize);
                        mainCanvasContext.fillRect(0, (nCount - 7) * nSize, nSize, 7 * nSize);
                        mainCanvasContext.fillRect(6 * nSize, (nCount - 7) * nSize, nSize, 7 * nSize);
                        mainCanvasContext.fillRect(2 * nSize, 2 * nSize, 3 * nSize, 3 * nSize);
                        mainCanvasContext.fillRect((nCount - 7 + 2) * nSize, 2 * nSize, 3 * nSize, 3 * nSize);
                        mainCanvasContext.fillRect(2 * nSize, (nCount - 7 + 2) * nSize, 3 * nSize, 3 * nSize);
                        timingScale = ((_l = (_k = this.options.components) === null || _k === void 0 ? void 0 : _k.timing) === null || _l === void 0 ? void 0 : _l.scale) || defaultScale;
                        timingXyOffset = (1 - timingScale) * 0.5;
                        for (i = 0; i < nCount - 8; i += 2) {
                            AwesomeQR._drawDot(mainCanvasContext, 8 + i, 6, nSize, timingXyOffset, timingScale);
                            AwesomeQR._drawDot(mainCanvasContext, 6, 8 + i, nSize, timingXyOffset, timingScale);
                        }
                        cornerAlignmentScale = ((_o = (_m = this.options.components) === null || _m === void 0 ? void 0 : _m.cornerAlignment) === null || _o === void 0 ? void 0 : _o.scale) || defaultScale;
                        cornerAlignmentXyOffset = (1 - cornerAlignmentScale) * 0.5;
                        AwesomeQR._drawAlign(mainCanvasContext, cornerAlignmentCenter, cornerAlignmentCenter, nSize, cornerAlignmentXyOffset, cornerAlignmentScale, this.options.colorDark, ((_q = (_p = this.options.components) === null || _p === void 0 ? void 0 : _p.cornerAlignment) === null || _q === void 0 ? void 0 : _q.protectors) || false);
                        alignmentScale = ((_s = (_r = this.options.components) === null || _r === void 0 ? void 0 : _r.alignment) === null || _s === void 0 ? void 0 : _s.scale) || defaultScale;
                        alignmentXyOffset = (1 - alignmentScale) * 0.5;
                        for (i = 0; i < alignmentPatternCenters.length; i++) {
                            for (j = 0; j < alignmentPatternCenters.length; j++) {
                                agnX = alignmentPatternCenters[j];
                                agnY = alignmentPatternCenters[i];
                                if (agnX === 6 && (agnY === 6 || agnY === cornerAlignmentCenter)) {
                                    continue;
                                }
                                else if (agnY === 6 && (agnX === 6 || agnX === cornerAlignmentCenter)) {
                                    continue;
                                }
                                else if (agnX === cornerAlignmentCenter && agnY === cornerAlignmentCenter) {
                                    continue;
                                }
                                else {
                                    AwesomeQR._drawAlign(mainCanvasContext, agnX, agnY, nSize, alignmentXyOffset, alignmentScale, this.options.colorDark, ((_u = (_t = this.options.components) === null || _t === void 0 ? void 0 : _t.alignment) === null || _u === void 0 ? void 0 : _u.protectors) || false);
                                }
                            }
                        }
                        // Fill the margin
                        if (whiteMargin) {
                            mainCanvasContext.fillStyle = "#FFFFFF";
                            mainCanvasContext.fillRect(-margin, -margin, size, margin);
                            mainCanvasContext.fillRect(-margin, viewportSize, size, margin);
                            mainCanvasContext.fillRect(viewportSize, -margin, margin, size);
                            mainCanvasContext.fillRect(-margin, -margin, margin, size);
                        }
                        if (!!!this.options.logoImage) return [3 /*break*/, 6];
                        return [4 /*yield*/, (0, skia_canvas_1.loadImage)(this.options.logoImage)];
                    case 5:
                        logoImage = _v.sent();
                        logoScale = this.options.logoScale;
                        logoMargin = this.options.logoMargin;
                        logoCornerRadius = this.options.logoCornerRadius;
                        if (logoScale <= 0 || logoScale >= 1.0) {
                            logoScale = 0.2;
                        }
                        if (logoMargin < 0) {
                            logoMargin = 0;
                        }
                        if (logoCornerRadius < 0) {
                            logoCornerRadius = 0;
                        }
                        logoSize = viewportSize * logoScale;
                        x = 0.5 * (size - logoSize);
                        y = x;
                        // Restore the canvas
                        // After restoring, the top and left margins should be taken into account
                        mainCanvasContext.restore();
                        // Clean the area that the logo covers (including margins)
                        mainCanvasContext.fillStyle = "#FFFFFF";
                        mainCanvasContext.save();
                        AwesomeQR._prepareRoundedCornerClip(mainCanvasContext, x - logoMargin, y - logoMargin, logoSize + 2 * logoMargin, logoSize + 2 * logoMargin, logoCornerRadius + logoMargin);
                        mainCanvasContext.clip();
                        oldGlobalCompositeOperation = mainCanvasContext.globalCompositeOperation;
                        mainCanvasContext.globalCompositeOperation = "destination-out";
                        mainCanvasContext.fill();
                        mainCanvasContext.globalCompositeOperation = oldGlobalCompositeOperation;
                        mainCanvasContext.restore();
                        // Draw logo image
                        mainCanvasContext.save();
                        AwesomeQR._prepareRoundedCornerClip(mainCanvasContext, x, y, logoSize, logoSize, logoCornerRadius);
                        mainCanvasContext.clip();
                        mainCanvasContext.drawImage(logoImage, x, y, logoSize, logoSize);
                        mainCanvasContext.restore();
                        // Re-translate the canvas to translate the top and left margins into invisible area
                        mainCanvasContext.save();
                        mainCanvasContext.translate(margin, margin);
                        _v.label = 6;
                    case 6:
                        if (!!parsedGIFBackground) {
                            gifFrames.forEach(function (frame) {
                                if (!gifOutput_1) {
                                    gifOutput_1 = new GIFEncoder_1.default(rawSize, rawSize);
                                    gifOutput_1.setDelay(frame.delay);
                                    gifOutput_1.setRepeat(0);
                                }
                                var _a = frame.dims, width = _a.width, height = _a.height;
                                if (!backgroundCanvas_1) {
                                    backgroundCanvas_1 = new skia_canvas_1.Canvas(width, height);
                                    backgroundCanvasContext_1 = backgroundCanvas_1.getContext("2d");
                                    backgroundCanvasContext_1.rect(0, 0, backgroundCanvas_1.width, backgroundCanvas_1.height);
                                    backgroundCanvasContext_1.fillStyle = "#ffffff";
                                    backgroundCanvasContext_1.fill();
                                }
                                if (!patchCanvas_1 || !patchData_1 || width !== patchCanvas_1.width || height !== patchCanvas_1.height) {
                                    patchCanvas_1 = new skia_canvas_1.Canvas(width, height);
                                    patchCanvasContext_1 = patchCanvas_1.getContext("2d");
                                    patchData_1 = patchCanvasContext_1.createImageData(width, height);
                                }
                                patchData_1.data.set(frame.patch);
                                patchCanvasContext_1.putImageData(patchData_1, 0, 0);
                                backgroundCanvasContext_1.drawImage(patchCanvas_1.getContext('2d').canvas, frame.dims.left, frame.dims.top);
                                var unscaledCanvas = new skia_canvas_1.Canvas(size, size);
                                var unscaledCanvasContext = unscaledCanvas.getContext("2d");
                                unscaledCanvasContext.drawImage(backgroundCanvas_1.getContext('2d').canvas, 0, 0, size, size);
                                unscaledCanvasContext.rect(0, 0, size, size);
                                unscaledCanvasContext.fillStyle = backgroundDimming;
                                unscaledCanvasContext.fill();
                                unscaledCanvasContext.drawImage(mainCanvas.getContext('2d').canvas, 0, 0, size, size);
                                // Scale the final image
                                var outCanvas = new skia_canvas_1.Canvas(rawSize, rawSize);
                                var outCanvasContext = outCanvas.getContext("2d");
                                outCanvasContext.drawImage(unscaledCanvas.getContext('2d').canvas, 0, 0, rawSize, rawSize);
                                gifOutput_1.addFrame(outCanvasContext.getImageData(0, 0, outCanvas.width, outCanvas.height).data);
                            });
                            if (!gifOutput_1) {
                                throw new Error("No frames.");
                            }
                            gifOutput_1.finish();
                            if (isElement(this.canvas)) {
                                u8array = gifOutput_1.stream().toFlattenUint8Array();
                                binary = u8array.reduce(function (bin, u8) { return bin + String.fromCharCode(u8); }, "");
                                return [2 /*return*/, Promise.resolve("data:image/gif;base64,".concat(window.btoa(binary)))];
                            }
                            return [2 /*return*/, Promise.resolve(Buffer.from(gifOutput_1.stream().toFlattenUint8Array()))];
                        }
                        else {
                            // Swap and merge the foreground and the background
                            console.log('BackGround Info 1212', size, margin, rawSize);
                            backgroundCanvasContext.drawImage(mainCanvas.getContext('2d').canvas, 0, 0, size, size);
                            mainCanvasContext.drawImage(backgroundCanvas.getContext('2d').canvas, -margin, -margin, size, size);
                            outCanvas = new skia_canvas_1.Canvas(rawSize, rawSize);
                            outCanvasContext = outCanvas.getContext("2d");
                            outCanvasContext.drawImage(mainCanvas.getContext('2d').canvas, 0, 0, rawSize, rawSize);
                            this.canvas = outCanvas;
                            format = this.options.gifBackground ? "gif" : file;
                            if (isElement(this.canvas)) {
                                // @ts-ignore
                                return [2 /*return*/, Promise.resolve(this.canvas.toDataURL(format))];
                            }
                            console.log('BackGround NodeTTt Xinfang', file);
                            // @ts-ignore
                            return [2 /*return*/, Promise.resolve(this.canvas.toBuffer(format))];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    AwesomeQR.CorrectLevel = qrcode_1.QRErrorCorrectLevel;
    AwesomeQR.defaultComponentOptions = {
        data: {
            scale: 1,
        },
        timing: {
            scale: 1,
            protectors: false,
        },
        alignment: {
            scale: 1,
            protectors: false,
        },
        cornerAlignment: {
            scale: 1,
            protectors: true,
        },
    };
    AwesomeQR.defaultOptions = {
        text: "",
        size: 400,
        margin: 20,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: qrcode_1.QRErrorCorrectLevel.M,
        backgroundImage: undefined,
        backgroundDimming: "rgba(0,0,0,0)",
        logoImage: undefined,
        logoScale: 0.2,
        logoMargin: 4,
        logoCornerRadius: 8,
        whiteMargin: true,
        components: AwesomeQR.defaultComponentOptions,
        autoColor: true,
        file: "png",
    };
    return AwesomeQR;
}());
exports.AwesomeQR = AwesomeQR;
function isElement(obj) {
    try {
        //Using W3 DOM2 (works for FF, Opera and Chrome)
        return obj instanceof HTMLElement;
    }
    catch (e) {
        //Browsers not supporting W3 DOM2 don't have HTMLElement and
        //an exception is thrown and we end up here. Testing some
        //properties that all elements have (works on IE7)
        return (typeof obj === "object" &&
            obj.nodeType === 1 &&
            typeof obj.style === "object" &&
            typeof obj.ownerDocument === "object");
    }
}
