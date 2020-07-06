import { Canvas, CanvasRenderingContext2D, createCanvas } from "canvas";
import { decompressFrames, parseGIF } from "gifuct-js";
import { QRCodeModel, QRErrorCorrectLevel, QRUtil } from "./core";
import GIFEncoder from "./gif.js/GIFEncoder";

namespace AwesomeQR {
  export type Options = {
    text: string;
    size?: number;
    margin?: number;
    typeNumber?: number;
    colorDark?: string;
    colorLight?: string;
    correctLevel?: QRErrorCorrectLevel;
    backgroundImage?: string | HTMLImageElement;
    backgroundDimming?: string;
    gifBackground?: ArrayBuffer;
    logoImage?: string | HTMLImageElement;
    logoScale?: number;
    logoMargin?: number;
    logoCornerRadius?: number;
    whiteMargin?: boolean;
    dotScale?: number;
    autoColor?: boolean;
  };
}

const castImage = (imgOrSrc: HTMLImageElement | string): HTMLImageElement => {
  if (typeof imgOrSrc === "string") {
    const img = new Image();
    img.src = imgOrSrc;
    return img;
  } else {
    return imgOrSrc;
  }
};

export default class AwesomeQR {
  private canvas: Canvas;
  private canvasContext: CanvasRenderingContext2D;
  private qrCode?: QRCodeModel;
  private options: AwesomeQR.Options;

  static CorrectLevel = QRErrorCorrectLevel;

  static _defaultOptions: AwesomeQR.Options = {
    text: "",
    size: 800,
    margin: 20,
    typeNumber: 4,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRErrorCorrectLevel.M,
    backgroundImage: undefined,
    backgroundDimming: "rgba(0,0,0,0)",
    logoImage: undefined,
    logoScale: 0.2,
    logoMargin: 6,
    logoCornerRadius: 8,
    whiteMargin: true,
    dotScale: 0.35,
    autoColor: true,
  };

  constructor(options: AwesomeQR.Options) {
    const _options = Object.assign({}, options);
    (Object.keys(AwesomeQR._defaultOptions) as (keyof AwesomeQR.Options)[]).map((k) => {
      if (!(k in _options)) {
        Object.defineProperty(_options, k, {
          value: AwesomeQR._defaultOptions[k],
          enumerable: true,
          writable: true,
        });
      }
    });
    this.options = _options;
    this.canvas = createCanvas(options.size!, options.size!);
    this.canvasContext = this.canvas.getContext("2d")!;
    this.qrCode = new QRCodeModel(-1, this.options.correctLevel!);
    this.qrCode.addData(this.options.text);
    this.qrCode.make();
  }

  draw(): Promise<Buffer | ArrayBuffer | undefined> {
    return new Promise((resolve) => this._draw().then(resolve));
  }

  private _clear() {
    this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private static _prepareRoundedCornerClip(
    canvasContext: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) {
    canvasContext.beginPath();
    canvasContext.moveTo(x, y);
    canvasContext.arcTo(x + w, y, x + w, y + h, r);
    canvasContext.arcTo(x + w, y + h, x, y + h, r);
    canvasContext.arcTo(x, y + h, x, y, r);
    canvasContext.arcTo(x, y, x + w, y, r);
    canvasContext.closePath();
  }

  private static _getAverageRGB(imgOrSrc: HTMLImageElement | string) {
    const el = castImage(imgOrSrc);
    const blockSize = 5;
    const defaultRGB = {
      r: 0,
      g: 0,
      b: 0,
    };
    let width, height;
    let i = -4;
    const rgb = {
      r: 0,
      g: 0,
      b: 0,
    };
    let count = 0;

    height = el.naturalHeight || el.offsetHeight || el.height;
    width = el.naturalWidth || el.offsetWidth || el.width;

    const canvas = createCanvas(width, height);
    const context = canvas.getContext("2d");

    if (!context) {
      return defaultRGB;
    }

    context.drawImage(el, 0, 0);

    let data;
    try {
      data = context.getImageData(0, 0, width, height);
    } catch (e) {
      return defaultRGB;
    }

    while ((i += blockSize * 4) < data.data.length) {
      if (data.data[i] > 200 || data.data[i + 1] > 200 || data.data[i + 2] > 200) continue;
      ++count;
      rgb.r += data.data[i];
      rgb.g += data.data[i + 1];
      rgb.b += data.data[i + 2];
    }

    rgb.r = ~~(rgb.r / count);
    rgb.g = ~~(rgb.g / count);
    rgb.b = ~~(rgb.b / count);

    return rgb;
  }

  private static _drawAlignProtector(
    canvasContext: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    nWidth: number,
    nHeight: number
  ) {
    canvasContext.clearRect((centerX - 2) * nWidth, (centerY - 2) * nHeight, 5 * nWidth, 5 * nHeight);
    canvasContext.fillRect((centerX - 2) * nWidth, (centerY - 2) * nHeight, 5 * nWidth, 5 * nHeight);
  }

  private static _drawAlign(
    canvasContext: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    nWidth: number,
    nHeight: number
  ) {
    canvasContext.fillRect((centerX - 2) * nWidth, (centerY - 2) * nHeight, nWidth, 4 * nHeight);
    canvasContext.fillRect((centerX + 2) * nWidth, (centerY - 2 + 1) * nHeight, nWidth, 4 * nHeight);
    canvasContext.fillRect((centerX - 2 + 1) * nWidth, (centerY - 2) * nHeight, 4 * nWidth, nHeight);
    canvasContext.fillRect((centerX - 2) * nWidth, (centerY + 2) * nHeight, 4 * nWidth, nHeight);
    canvasContext.fillRect(centerX * nWidth, centerY * nHeight, nWidth, nHeight);
  }

  private async _draw(): Promise<Buffer | ArrayBuffer | undefined> {
    const nCount = this.qrCode?.moduleCount!;
    const rawSize = this.options.size!;
    let rawMargin = this.options.margin!;

    if (rawMargin < 0 || rawMargin * 2 >= rawSize) {
      rawMargin = 0;
    }

    const margin = Math.ceil(rawMargin);
    const rawViewportSize = rawSize - 2 * rawMargin;

    const whiteMargin = this.options.whiteMargin!;
    const backgroundDimming = this.options.backgroundDimming!;
    const nSize = Math.ceil(rawViewportSize / nCount);
    const viewportSize = nSize * nCount;
    const size = viewportSize + 2 * margin;

    const _tCanvas = createCanvas(size, size);
    const _oContext = _tCanvas.getContext("2d");

    const dotScale = this.options.dotScale!;
    this._clear();

    if (dotScale <= 0 || dotScale > 1) {
      throw new Error("Scale should be in range (0, 1].");
    }

    // Leave room for margin
    _oContext.save();
    _oContext.translate(margin, margin);

    const _bkgCanvas = createCanvas(size, size);
    const _bContext = _bkgCanvas.getContext("2d");

    let parsedGIFBackground = null;
    let gifFrames: any[] = [];

    if (!!this.options.gifBackground) {
      const gif = parseGIF(this.options.gifBackground);
      if (!gif.raw.hasImages) {
        throw new Error("An invalid gif has been selected as the background.");
      }
      parsedGIFBackground = gif;
      gifFrames = decompressFrames(gif, true);
      if (this.options.autoColor) {
        let r = 0,
          g = 0,
          b = 0;
        let count = 0;
        for (let i = 0; i < gifFrames[0].colorTable.length; i++) {
          const c = gifFrames[0].colorTable[i];
          if (c[0] > 200 || c[1] > 200 || c[2] > 200) continue;
          if (c[0] === 0 && c[1] === 0 && c[2] === 0) continue;
          count++;
          r += c[0];
          g += c[1];
          b += c[2];
        }

        r = ~~(r / count);
        g = ~~(g / count);
        b = ~~(b / count);
        this.options.colorDark = `rgb(${r},${g},${b})`;
      }
    } else if (!!this.options.backgroundImage) {
      if (this.options.autoColor) {
        const avgRGB = AwesomeQR._getAverageRGB(this.options.backgroundImage!);
        this.options.colorDark = `rgb(${avgRGB.r},${avgRGB.g},${avgRGB.b})`;
      }

      const backgroundImage = castImage(this.options.backgroundImage);

      _bContext.drawImage(backgroundImage, 0, 0, backgroundImage.width, backgroundImage.height, 0, 0, size, size);
      _bContext.rect(0, 0, size, size);
      _bContext.fillStyle = backgroundDimming;
      _bContext.fill();
    } else {
      _bContext.rect(0, 0, size, size);
      _bContext.fillStyle = "#ffffff";
      _bContext.fill();
    }

    const agnPatternCenter = QRUtil.getPatternPosition(this.qrCode!.typeNumber);

    const xyOffset = (1 - dotScale) * 0.5;
    for (let row = 0; row < nCount; row++) {
      for (let col = 0; col < nCount; col++) {
        const bIsDark = this.qrCode!.isDark(row, col);
        const isBlkPosCtr = (col < 8 && (row < 8 || row >= nCount - 8)) || (col >= nCount - 8 && row < 8);
        let bProtected = row === 6 || col === 6 || isBlkPosCtr;

        for (let i = 0; i < agnPatternCenter.length - 1; i++) {
          bProtected =
            bProtected ||
            (row >= agnPatternCenter[i] - 2 &&
              row <= agnPatternCenter[i] + 2 &&
              col >= agnPatternCenter[i] - 2 &&
              col <= agnPatternCenter[i] + 2);
        }

        const nLeft = col * nSize + (bProtected ? 0 : xyOffset * nSize);
        const nTop = row * nSize + (bProtected ? 0 : xyOffset * nSize);
        _oContext.strokeStyle = bIsDark ? this.options.colorDark! : this.options.colorLight!;
        _oContext.lineWidth = 0.5;
        _oContext.fillStyle = bIsDark ? this.options.colorDark! : "rgba(255, 255, 255, 0.6)";
        if (!bProtected) {
          const inAgnRange = col < nCount - 4 && col >= nCount - 4 - 5 && row < nCount - 4 && row >= nCount - 4 - 5;
          if (agnPatternCenter.length === 0 || !inAgnRange) {
            // if align pattern list is empty, then it means that we don't need to leave room for the align patterns
            _oContext.fillRect(
              nLeft,
              nTop,
              (bProtected ? (isBlkPosCtr ? 1 : 1) : dotScale) * nSize,
              (bProtected ? (isBlkPosCtr ? 1 : 1) : dotScale) * nSize
            );
          }
        }
      }
    }

    // Draw POSITION protectors
    const protectorStyle = "rgba(255, 255, 255, 0.6)";
    _oContext.fillStyle = protectorStyle;
    _oContext.fillRect(0, 0, 8 * nSize, 8 * nSize);
    _oContext.fillRect(0, (nCount - 8) * nSize, 8 * nSize, 8 * nSize);
    _oContext.fillRect((nCount - 8) * nSize, 0, 8 * nSize, 8 * nSize);
    _oContext.fillRect(8 * nSize, 6 * nSize, (nCount - 8 - 8) * nSize, nSize);
    _oContext.fillRect(6 * nSize, 8 * nSize, nSize, (nCount - 8 - 8) * nSize);

    // Draw ALIGN protectors
    const edgeCenter = agnPatternCenter[agnPatternCenter.length - 1];
    for (let i = 0; i < agnPatternCenter.length; i++) {
      for (let j = 0; j < agnPatternCenter.length; j++) {
        const agnX = agnPatternCenter[j];
        const agnY = agnPatternCenter[i];
        if (agnX === 6 && (agnY === 6 || agnY === edgeCenter)) {
          continue;
        } else if (agnY === 6 && (agnX === 6 || agnX === edgeCenter)) {
          continue;
        } else if (agnX !== 6 && agnX !== edgeCenter && agnY !== 6 && agnY !== edgeCenter) {
          AwesomeQR._drawAlignProtector(_oContext, agnX, agnY, nSize, nSize);
        } else {
          AwesomeQR._drawAlignProtector(_oContext, agnX, agnY, nSize, nSize);
        }
      }
    }

    // Draw POSITION patterns
    _oContext.fillStyle = this.options.colorDark!;
    _oContext.fillRect(0, 0, 7 * nSize, nSize);
    _oContext.fillRect((nCount - 7) * nSize, 0, 7 * nSize, nSize);
    _oContext.fillRect(0, 6 * nSize, 7 * nSize, nSize);
    _oContext.fillRect((nCount - 7) * nSize, 6 * nSize, 7 * nSize, nSize);
    _oContext.fillRect(0, (nCount - 7) * nSize, 7 * nSize, nSize);
    _oContext.fillRect(0, (nCount - 7 + 6) * nSize, 7 * nSize, nSize);
    _oContext.fillRect(0, 0, nSize, 7 * nSize);
    _oContext.fillRect(6 * nSize, 0, nSize, 7 * nSize);
    _oContext.fillRect((nCount - 7) * nSize, 0, nSize, 7 * nSize);
    _oContext.fillRect((nCount - 7 + 6) * nSize, 0, nSize, 7 * nSize);
    _oContext.fillRect(0, (nCount - 7) * nSize, nSize, 7 * nSize);
    _oContext.fillRect(6 * nSize, (nCount - 7) * nSize, nSize, 7 * nSize);

    _oContext.fillRect(2 * nSize, 2 * nSize, 3 * nSize, 3 * nSize);
    _oContext.fillRect((nCount - 7 + 2) * nSize, 2 * nSize, 3 * nSize, 3 * nSize);
    _oContext.fillRect(2 * nSize, (nCount - 7 + 2) * nSize, 3 * nSize, 3 * nSize);

    for (let i = 0; i < nCount - 8; i += 2) {
      _oContext.fillRect((8 + i) * nSize, 6 * nSize, nSize, nSize);
      _oContext.fillRect(6 * nSize, (8 + i) * nSize, nSize, nSize);
    }
    for (let i = 0; i < agnPatternCenter.length; i++) {
      for (let j = 0; j < agnPatternCenter.length; j++) {
        const agnX = agnPatternCenter[j];
        const agnY = agnPatternCenter[i];
        if (agnX === 6 && (agnY === 6 || agnY === edgeCenter)) {
          continue;
        } else if (agnY === 6 && (agnX === 6 || agnX === edgeCenter)) {
          continue;
        } else if (agnX !== 6 && agnX !== edgeCenter && agnY !== 6 && agnY !== edgeCenter) {
          _oContext.fillStyle = "rgba(0, 0, 0, .2)";
          AwesomeQR._drawAlign(_oContext, agnX, agnY, nSize, nSize);
        } else {
          _oContext.fillStyle = this.options.colorDark!;
          AwesomeQR._drawAlign(_oContext, agnX, agnY, nSize, nSize);
        }
      }
    }

    // Fill the margin
    if (whiteMargin) {
      _oContext.fillStyle = "#FFFFFF";
      _oContext.fillRect(-margin, -margin, size, margin);
      _oContext.fillRect(-margin, viewportSize, size, margin);
      _oContext.fillRect(viewportSize, -margin, margin, size);
      _oContext.fillRect(-margin, -margin, margin, size);
    }

    if (!!this.options.logoImage) {
      let logoScale = this.options.logoScale!;
      let logoMargin = this.options.logoMargin!;
      let logoCornerRadius = this.options.logoCornerRadius!;
      const logoImage = castImage(this.options.logoImage!);
      if (logoScale <= 0 || logoScale >= 1.0) {
        logoScale = 0.2;
      }
      if (logoMargin < 0) {
        logoMargin = 0;
      }
      if (logoCornerRadius < 0) {
        logoCornerRadius = 0;
      }

      _oContext.restore();

      const logoSize = viewportSize * logoScale;
      const x = 0.5 * (size - logoSize);
      const y = x;

      _oContext.fillStyle = "#FFFFFF";
      _oContext.save();
      AwesomeQR._prepareRoundedCornerClip(
        _oContext,
        x - logoMargin,
        y - logoMargin,
        logoSize + 2 * logoMargin,
        logoSize + 2 * logoMargin,
        logoCornerRadius
      );
      _oContext.clip();
      _oContext.fill();
      _oContext.restore();

      _oContext.save();
      AwesomeQR._prepareRoundedCornerClip(_oContext, x, y, logoSize, logoSize, logoCornerRadius);
      _oContext.clip();
      _oContext.drawImage(logoImage, x, y, logoSize, logoSize);
      _oContext.restore();
    }

    if (!!parsedGIFBackground) {
      let gifOutput: any;

      // Reuse in order to apply the patch
      let backgroundCanvas: Canvas;
      let backgroundCanvasContext: CanvasRenderingContext2D;

      let patchCanvas: Canvas;
      let patchCanvasContext: CanvasRenderingContext2D;
      let patchData: any;

      gifFrames.forEach(function (frame: any) {
        if (!gifOutput) {
          gifOutput = new GIFEncoder(rawSize, rawSize);
        }

        const { width, height } = frame.dims;
        if (backgroundCanvas === undefined) {
          backgroundCanvas = createCanvas(width, height);
          backgroundCanvasContext = backgroundCanvas.getContext("2d");
          backgroundCanvasContext.rect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
          backgroundCanvasContext.fillStyle = "#ffffff";
          backgroundCanvasContext.fill();
        }

        if (!patchCanvas || !patchData || width !== patchCanvas.width || height !== patchCanvas.height) {
          patchCanvas = createCanvas(width, height);
          patchCanvasContext = patchCanvas.getContext("2d");
          patchData = patchCanvasContext.createImageData(width, height);
        }

        patchData.data.set(frame.patch);
        patchCanvasContext.putImageData(patchData, 0, 0);

        backgroundCanvasContext.drawImage(patchCanvas, frame.dims.left, frame.dims.top);

        const unscaledCanvas = createCanvas(size, size);
        const unscaledCanvasContext = unscaledCanvas.getContext("2d");

        unscaledCanvasContext.drawImage(backgroundCanvas, 0, 0, size, size);
        unscaledCanvasContext.drawImage(_tCanvas, 0, 0, size, size);

        // Scale the final image
        const _fCanvas = createCanvas(rawSize, rawSize);
        const _fContext = _fCanvas.getContext("2d");
        _fContext.drawImage(unscaledCanvas, 0, 0, rawSize, rawSize);
        gifOutput.addFrame(_fContext, { copy: true, delay: frame.delay });
      });

      if (gifOutput === undefined) {
        throw new Error("No frames.");
      }

      const renderAsync = new Promise<ArrayBuffer>((resolve) =>
        gifOutput.on("finished", (blob: any) => resolve(blob.arrayBuffer()))
      );

      gifOutput.render();

      return Promise.resolve(await renderAsync);
    } else {
      // Swap and merge the foreground and the background
      _bContext.drawImage(_tCanvas, 0, 0, size, size);
      _oContext.drawImage(_bkgCanvas, -margin, -margin, size, size);

      // Scale the final image
      const _fCanvas = createCanvas(rawSize, rawSize); //document.createElement("canvas");
      const _fContext = _fCanvas.getContext("2d");
      _fContext.drawImage(_tCanvas, 0, 0, rawSize, rawSize);
      this.canvas = _fCanvas;

      return Promise.resolve(this.canvas.toBuffer());
    }
  }
}
