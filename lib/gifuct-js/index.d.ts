export function parseGIF(arrayBuffer: any): any;
export function decompressFrame(frame: any, gct: any, buildImagePatch: any): {
    pixels: any[];
    dims: {
        top: any;
        left: any;
        width: any;
        height: any;
    };
} | undefined;
export function decompressFrames(parsedGif: any, buildImagePatches: any): any;
