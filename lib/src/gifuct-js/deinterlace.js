"use strict";
/**
 * Deinterlace function from https://github.com/shachaf/jsgif
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.deinterlace = void 0;
var deinterlace = function (pixels, width) {
    var newPixels = new Array(pixels.length);
    var rows = pixels.length / width;
    var cpRow = function (toRow, fromRow) {
        var fromPixels = pixels.slice(fromRow * width, (fromRow + 1) * width);
        newPixels.splice.apply(newPixels, [toRow * width, width].concat(fromPixels));
    };
    // See appendix E.
    var offsets = [0, 4, 2, 1];
    var steps = [8, 8, 4, 2];
    var fromRow = 0;
    for (var pass = 0; pass < 4; pass++) {
        for (var toRow = offsets[pass]; toRow < rows; toRow += steps[pass]) {
            cpRow(toRow, fromRow);
            fromRow++;
        }
    }
    return newPixels;
};
exports.deinterlace = deinterlace;
