export = NeuQuant;
declare function NeuQuant(pixels: any, samplefac: any): void;
declare class NeuQuant {
    constructor(pixels: any, samplefac: any);
    buildColormap: () => void;
    getColormap: () => any[];
    lookupRGB: (b: any, g: any, r: any) => number;
}
