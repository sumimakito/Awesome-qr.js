"use strict";
/**
 * javascript port of java LZW decompression
 * Original java author url: https://gist.github.com/devunwired/4479231
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.lzw = void 0;
var lzw = function (minCodeSize, data, pixelCount) {
    var MAX_STACK_SIZE = 4096;
    var nullCode = -1;
    var npix = pixelCount;
    var available, clear, code_mask, code_size, end_of_information, in_code, old_code, bits, code, i, datum, data_size, first, top, bi, pi;
    var dstPixels = new Array(pixelCount);
    var prefix = new Array(MAX_STACK_SIZE);
    var suffix = new Array(MAX_STACK_SIZE);
    var pixelStack = new Array(MAX_STACK_SIZE + 1);
    // Initialize GIF data stream decoder.
    data_size = minCodeSize;
    clear = 1 << data_size;
    end_of_information = clear + 1;
    available = clear + 2;
    old_code = nullCode;
    code_size = data_size + 1;
    code_mask = (1 << code_size) - 1;
    for (code = 0; code < clear; code++) {
        prefix[code] = 0;
        suffix[code] = code;
    }
    // Decode GIF pixel stream.
    var datum, bits, count, first, top, pi, bi;
    datum = bits = count = first = top = pi = bi = 0;
    for (i = 0; i < npix;) {
        if (top === 0) {
            if (bits < code_size) {
                // get the next byte
                datum += data[bi] << bits;
                bits += 8;
                bi++;
                continue;
            }
            // Get the next code.
            code = datum & code_mask;
            datum >>= code_size;
            bits -= code_size;
            // Interpret the code
            if (code > available || code == end_of_information) {
                break;
            }
            if (code == clear) {
                // Reset decoder.
                code_size = data_size + 1;
                code_mask = (1 << code_size) - 1;
                available = clear + 2;
                old_code = nullCode;
                continue;
            }
            if (old_code == nullCode) {
                pixelStack[top++] = suffix[code];
                old_code = code;
                first = code;
                continue;
            }
            in_code = code;
            if (code == available) {
                pixelStack[top++] = first;
                code = old_code;
            }
            while (code > clear) {
                pixelStack[top++] = suffix[code];
                code = prefix[code];
            }
            first = suffix[code] & 0xff;
            pixelStack[top++] = first;
            // add a new string to the table, but only if space is available
            // if not, just continue with current table until a clear code is found
            // (deferred clear code implementation as per GIF spec)
            if (available < MAX_STACK_SIZE) {
                prefix[available] = old_code;
                suffix[available] = first;
                available++;
                if ((available & code_mask) === 0 && available < MAX_STACK_SIZE) {
                    code_size++;
                    code_mask += available;
                }
            }
            old_code = in_code;
        }
        // Pop a pixel off the pixel stack.
        top--;
        dstPixels[pi++] = pixelStack[top];
        i++;
    }
    for (i = pi; i < npix; i++) {
        dstPixels[i] = 0; // clear missing pixels
    }
    return dstPixels;
};
exports.lzw = lzw;
