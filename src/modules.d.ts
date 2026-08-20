import 'skia-canvas';

declare module "gifuct-js" {
  export function decompressFrames(parsedGif, buildImagePatches): any;
  export function parseGIF(arrayBuffer: ArrayBuffer): any;
}
declare module 'skia-canvas' {
  interface Image {
    /** 擴展屬性：獲取圖片的原始寬度（等同於 width） */
    readonly naturalWidth: number;
    /** 擴展屬性：獲取圖片的原始高度（等同於 height） */
    readonly naturalHeight: number;
  }
}