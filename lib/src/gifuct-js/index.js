"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decompressFrames = exports.decompressFrame = exports.parseGIF = void 0;
var gif_1 = __importDefault(require("js-binary-schema-parser/lib/schemas/gif"));
var js_binary_schema_parser_1 = require("js-binary-schema-parser");
var uint8_1 = require("js-binary-schema-parser/lib/parsers/uint8");
var deinterlace_1 = require("./deinterlace");
var lzw_1 = require("./lzw");
var parseGIF = function (arrayBuffer) {
    var byteData = new Uint8Array(arrayBuffer);
    return (0, js_binary_schema_parser_1.parse)((0, uint8_1.buildStream)(byteData), gif_1.default);
};
exports.parseGIF = parseGIF;
var generatePatch = function (image) {
    var totalPixels = image.pixels.length;
    var patchData = new Uint8ClampedArray(totalPixels * 4);
    for (var i = 0; i < totalPixels; i++) {
        var pos = i * 4;
        var colorIndex = image.pixels[i];
        var color = image.colorTable[colorIndex];
        patchData[pos] = color[0];
        patchData[pos + 1] = color[1];
        patchData[pos + 2] = color[2];
        patchData[pos + 3] = colorIndex !== image.transparentIndex ? 255 : 0;
    }
    return patchData;
};
var decompressFrame = function (frame, gct, buildImagePatch) {
    if (!frame.image) {
        console.warn('gif frame does not have associated image.');
        return;
    }
    var image = frame.image;
    // get the number of pixels
    var totalPixels = image.descriptor.width * image.descriptor.height;
    // do lzw decompression
    var pixels = (0, lzw_1.lzw)(image.data.minCodeSize, image.data.blocks, totalPixels);
    // deal with interlacing if necessary
    if (image.descriptor.lct.interlaced) {
        pixels = (0, deinterlace_1.deinterlace)(pixels, image.descriptor.width);
    }
    var resultImage = {
        pixels: pixels,
        dims: {
            top: frame.image.descriptor.top,
            left: frame.image.descriptor.left,
            width: frame.image.descriptor.width,
            height: frame.image.descriptor.height
        }
    };
    // color table
    if (image.descriptor.lct && image.descriptor.lct.exists) {
        resultImage.colorTable = image.lct;
    }
    else {
        resultImage.colorTable = gct;
    }
    // add per frame relevant gce information
    if (frame.gce) {
        resultImage.delay = (frame.gce.delay || 10) * 10; // convert to ms
        resultImage.disposalType = frame.gce.extras.disposal;
        // transparency
        if (frame.gce.extras.transparentColorGiven) {
            resultImage.transparentIndex = frame.gce.transparentColorIndex;
        }
    }
    // create canvas usable imagedata if desired
    if (buildImagePatch) {
        resultImage.patch = generatePatch(resultImage);
    }
    return resultImage;
};
exports.decompressFrame = decompressFrame;
var decompressFrames = function (parsedGif, buildImagePatches) {
    return parsedGif.frames
        .filter(function (f) { return f.image; })
        .map(function (f) { return (0, exports.decompressFrame)(f, parsedGif.gct, buildImagePatches); });
};
exports.decompressFrames = decompressFrames;
