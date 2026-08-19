"use strict";
// Still working on this
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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
var index_1 = require("../src/index");
var jimp_1 = __importDefault(require("jimp"));
var crypto_1 = __importDefault(require("crypto"));
var assert_1 = __importDefault(require("assert"));
var jsqr_1 = __importDefault(require("jsqr"));
describe("Common tests", function () {
    it("Should draw and decode QR code without errors", function () { return __awaiter(void 0, void 0, void 0, function () {
        var expected, qr, buf, image, decoded;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    expected = "Awesome-qr.js🧡";
                    qr = new index_1.AwesomeQR({ text: expected, size: 400, margin: 10 });
                    return [4 /*yield*/, qr.draw()];
                case 1:
                    buf = (_a.sent());
                    return [4 /*yield*/, jimp_1.default.read(buf)];
                case 2:
                    image = _a.sent();
                    decoded = (0, jsqr_1.default)(Uint8ClampedArray.from(image.bitmap.data), image.bitmap.width, image.bitmap.height, {
                        inversionAttempts: "attemptBoth",
                    });
                    assert_1.default.strictEqual(expected, decoded === null || decoded === void 0 ? void 0 : decoded.data);
                    return [2 /*return*/];
            }
        });
    }); });
    it("Should fail drawing QR code due to excessive data", function () { return __awaiter(void 0, void 0, void 0, function () {
        var errorThrown, qr, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    errorThrown = false;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    qr = new index_1.AwesomeQR({
                        text: crypto_1.default.randomBytes(4000).toString(),
                        correctLevel: index_1.QRErrorCorrectLevel.L
                    });
                    return [4 /*yield*/, qr.draw()];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    // ✅ 成功捕捉到 "Too long data" 錯誤
                    errorThrown = true;
                    // 選填：如果您想進一步驗證錯誤訊息是否正確
                    if (err_1 instanceof Error) {
                        assert_1.default.strictEqual(err_1.message, "Too long data");
                    }
                    return [3 /*break*/, 4];
                case 4:
                    // ✅ 斷言測試：如果 errorThrown 為 false，代表沒有拋出錯誤，測試就會失敗
                    assert_1.default.ok(errorThrown, "Expecting an error to be thrown");
                    return [2 /*return*/];
            }
        });
    }); });
});
