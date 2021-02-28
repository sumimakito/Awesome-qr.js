import { Canvas, CanvasRenderingContext2D, createCanvas, Image, loadImage } from "canvas";
import { decompressFrames, parseGIF } from "./gifuct-js";
import { QRCodeModel, QRErrorCorrectLevel, QRUtil } from "./qrcode";
import GIFEncoder from "./gif.js/GIFEncoder";

const defaultScale = 0.4;

export type ComponentOptions = {
  /**
   * Component options for data/ECC.
   */
  data?: {
    /**
     * Scale factor for data/ECC dots.
     * @default 0.4
     */
    scale?: number;
  };

  /**
   * Component options for timing patterns.
   */
  timing?: {
    /**
     * Scale factor for timing patterns.
     * @default 0.5
     */
    scale?: number;

    /**
     * Protector for timing patterns.
     * @default false
     */
    protectors?: boolean;
  };

  /**
   * Component options for alignment patterns.
   */
  alignment?: {
    /**
     * Scale factor for alignment patterns.
     * @default 0.5
     */
    scale?: number;

    /**
     * Protector for alignment patterns.
     * @default false
     */
    protectors?: boolean;
  };

  /**
   * Component options for alignment pattern on the bottom-right corner.
   */
  cornerAlignment?: {
    /**
     * Scale factor for alignment pattern on the bottom-right corner.
     * @default 0.5
     */
    scale?: number;

    /**
     * Protector for alignment pattern on the bottom-right corner.
     * @default true
     */
    protectors?: boolean;
  };
};

export type Options = {
  /**
   * Text to be encoded in the QR code.
   */
  text: string;

  /**
   * Size of the QR code in pixel.
   *
   * @defaultValue 400
   */
  size?: number;

  /**
   * Size of margins around the QR code body in pixel.
   *
   * @defaultValue 20
   */
  margin?: number;

  /**
   * Error correction level of the QR code.
   *
   * Accepts a value provided by _QRErrorCorrectLevel_.
   *
   * For more information, please refer to [https://www.qrcode.com/en/about/error_correction.html](https://www.qrcode.com/en/about/error_correction.html).
   *
   * @defaultValue 0
   */
  correctLevel?: number;

  /**
   * **This is an advanced option.**
   *
   * Specify the mask pattern to be used in QR code encoding.
   *
   * Accepts a value provided by _QRMaskPattern_.
   *
   * To find out all eight mask patterns, please refer to [https://en.wikipedia.org/wiki/File:QR_Code_Mask_Patterns.svg](https://en.wikipedia.org/wiki/File:QR_Code_Mask_Patterns.svg)
   *
   * For more information, please refer to [https://en.wikiversity.org/wiki/Reed%E2%80%93Solomon_codes_for_coders#Masking](https://en.wikiversity.org/wiki/Reed%E2%80%93Solomon_codes_for_coders#Masking).
   */
  maskPattern?: number;

  /**
   * **This is an advanced option.**
   *
   * Specify the version to be used in QR code encoding.
   *
   * Accepts an integer in range [1, 40].
   *
   * For more information, please refer to [https://www.qrcode.com/en/about/version.html](https://www.qrcode.com/en/about/version.html).
   */
  version?: number;

  /**
   * Options to control components in the QR code.
   *
   * @deafultValue undefined
   */
  components?: ComponentOptions;

  /**
   * Color of the blocks on the QR code.
   *
   * Accepts a CSS &lt;color&gt;.
   *
   * For more information about CSS &lt;color&gt;, please refer to [https://developer.mozilla.org/en-US/docs/Web/CSS/color_value](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value).
   *
   * @defaultValue "#000000"
   */
  colorDark?: string;

  /**
   * Color of the empty areas on the QR code.
   *
   * Accepts a CSS &lt;color&gt;.
   *
   * For more information about CSS &lt;color&gt;, please refer to [https://developer.mozilla.org/en-US/docs/Web/CSS/color_value](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value).
   *
   * @defaultValue "#ffffff"
   */
  colorLight?: string;

  /**
   * Automatically calculate the _colorLight_ value from the QR code's background.
   *
   * @defaultValue true
   */
  autoColor?: boolean;

  /**
   * Background image to be used in the QR code.
   *
   * Accepts a `data:` string in web browsers or a Buffer in Node.js.
   *
   * @defaultValue undefined
   */
  backgroundImage?: string | Buffer;

  /**
   * Color of the dimming mask above the background image.
   *
   * Accepts a CSS &lt;color&gt;.
   *
   * For more information about CSS &lt;color&gt;, please refer to [https://developer.mozilla.org/en-US/docs/Web/CSS/color_value](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value).
   *
   * @defaultValue "rgba(0, 0, 0, 0)"
   */
  backgroundDimming?: string;

  /**
   * GIF background image to be used in the QR code.
   *
   * @defaultValue undefined
   */
  gifBackground?: ArrayBuffer;

  /**
   * Use a white margin instead of a transparent one which reveals the background of the QR code on margins.
   *
   * @defaultValue true
   */
  whiteMargin?: boolean;

  /**
   * @deprecated
   *
   * Ratio of the real size to the full size of the blocks.
   *
   * This can be helpful when you want to make more parts of the background visible.
   *
   * @deafultValue 0.4
   */
  dotScale?: number;

  /**
   * Logo image to be displayed at the center of the QR code.
   *
   * Accepts a `data:` string in web browsers or a Buffer in Node.js.
   *
   * When set to `undefined` or `null`, the logo is disabled.
   *
   * @defaultValue undefined
   */
  logoImage?: string;

  /**
   * Ratio of the logo size to the QR code size.
   *
   * @defaultValue 0.2
   */
  logoScale?: number;

  /**
   * Size of margins around the logo image in pixels.
   *
   * @defaultValue 6
   */
  logoMargin?: number;

  /**
   * Corner radius of the logo image in pixels.
   *
   * @defaultValue 8
   */
  logoCornerRadius?: number;
};

export class AwesomeQR {
  private canvas: Canvas;
  private canvasContext: CanvasRenderingContext2D;
  private qrCode?: QRCodeModel;
  private options: Options;

  static CorrectLevel = QRErrorCorrectLevel;

  private static defaultComponentOptions: ComponentOptions = {
    data: {
      scale: 0.4,
    },
    timing: {
      scale: 0.5,
      protectors: false,
    },
    alignment: {
      scale: 0.5,
      protectors: false,
    },
    cornerAlignment: {
      scale: 0.5,
      protectors: true,
    },
  };

  static defaultOptions: Options = {
    text: "",
    size: 400,
    margin: 20,
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
    components: AwesomeQR.defaultComponentOptions,
    autoColor: true,
  };

  constructor(options: Partial<Options>) {
    const _options = Object.assign({}, options);

    (Object.keys(AwesomeQR.defaultOptions) as (keyof Options)[]).forEach((k) => {
      if (!(k in _options)) {
        Object.defineProperty(_options, k, { value: AwesomeQR.defaultOptions[k], enumerable: true, writable: true });
      }
    });

    if (!_options.components) {
      _options.components = AwesomeQR.defaultComponentOptions;
    } else if (typeof _options.components === "object") {
      (Object.keys(AwesomeQR.defaultComponentOptions) as (keyof ComponentOptions)[]).forEach((k) => {
        if (!(k in _options.components!)) {
          Object.defineProperty(_options.components!, k, {
            value: AwesomeQR.defaultComponentOptions[k],
            enumerable: true,
            writable: true,
          });
        } else {
          Object.defineProperty(_options.components!, k, {
            value: { ...AwesomeQR.defaultComponentOptions[k], ..._options.components![k] },
            enumerable: true,
            writable: true,
          });
        }
      });
    }

    if (_options.dotScale) {
      _options.components.data!.scale = _options.dotScale;
      _options.components.timing!.scale = _options.dotScale;
      _options.components.alignment!.scale = _options.dotScale;
    }

    this.options = _options as Options;
    this.canvas = createCanvas(options.size!, options.size!);
    this.canvasContext = this.canvas.getContext("2d")!;
    this.qrCode = new QRCodeModel(-1, this.options.correctLevel!);
    if (Number.isInteger(this.options.maskPattern)) {
      this.qrCode.maskPattern = this.options.maskPattern!;
    }
    if (Number.isInteger(this.options.version)) {
      this.qrCode.typeNumber = this.options.version!;
    }
    this.qrCode.addData(this.options.text);
    this.qrCode.make();
  }

  draw(): Promise<Buffer | ArrayBuffer | string | undefined> {
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

  private static _getAverageRGB(image: Image) {
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

    height = image.naturalHeight || image.height;
    width = image.naturalWidth || image.width;

    const canvas = createCanvas(width, height);
    const context = canvas.getContext("2d");

    if (!context) {
      return defaultRGB;
    }

    context.drawImage(image, 0, 0);

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

  private static _drawDot(
    canvasContext: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    nSize: number,
    xyOffset: number = 0,
    dotScale: number = 1
  ) {
    canvasContext.fillRect(
      (centerX + xyOffset) * nSize,
      (centerY + xyOffset) * nSize,
      dotScale * nSize,
      dotScale * nSize
    );
  }

  private static _drawAlignProtector(
    canvasContext: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    nSize: number
  ) {
    canvasContext.clearRect((centerX - 2) * nSize, (centerY - 2) * nSize, 5 * nSize, 5 * nSize);
    canvasContext.fillRect((centerX - 2) * nSize, (centerY - 2) * nSize, 5 * nSize, 5 * nSize);

    // canvasContext.clearRect((centerX - 2) * nWidth, (centerY - 2) * nHeight, 5 * nWidth, 5 * nHeight);
    // canvasContext.fillRect((centerX - 2) * nWidth, (centerY - 2) * nHeight, 5 * nWidth, 5 * nHeight);
  }

  private static _drawAlign(
    canvasContext: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    nSize: number,
    xyOffset: number = 0,
    dotScale: number = 1,
    colorDark: string
  ) {
    const oldFillStyle = canvasContext.fillStyle;
    canvasContext.fillStyle = colorDark;
    new Array(4).fill(0).map((_, i) => {
      AwesomeQR._drawDot(canvasContext, centerX - 2 + i, centerY - 2, nSize, xyOffset, dotScale);
      AwesomeQR._drawDot(canvasContext, centerX + 2, centerY - 2 + i, nSize, xyOffset, dotScale);
      AwesomeQR._drawDot(canvasContext, centerX + 2 - i, centerY + 2, nSize, xyOffset, dotScale);
      AwesomeQR._drawDot(canvasContext, centerX - 2, centerY + 2 - i, nSize, xyOffset, dotScale);
    });
    AwesomeQR._drawDot(canvasContext, centerX, centerY, nSize, xyOffset, dotScale);
    canvasContext.fillStyle = "rgba(255, 255, 255, 0.6)";
    new Array(2).fill(0).map((_, i) => {
      // AwesomeQR._drawDot(canvasContext, centerX - 1 + i, centerY - 1, nSize, 0, 1);
      // AwesomeQR._drawDot(canvasContext, centerX + 1, centerY - 1 + i, nSize, 0, 1);
      // AwesomeQR._drawDot(canvasContext, centerX + 1 - i, centerY + 1, nSize, 0, 1);
      // AwesomeQR._drawDot(canvasContext, centerX - 1, centerY + 1 - i, nSize, 0, 1);
    });
    canvasContext.fillStyle = oldFillStyle;
  }

  private async _draw(): Promise<Buffer | Uint8Array | string | undefined> {
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

    const mainCanvas = createCanvas(size, size);
    const mainCanvasContext = mainCanvas.getContext("2d");

    const dotScale = this.options.dotScale!;
    this._clear();

    if (dotScale <= 0 || dotScale > 1) {
      throw new Error("Scale should be in range (0, 1].");
    }

    // Leave room for margin
    mainCanvasContext.save();
    mainCanvasContext.translate(margin, margin);

    const backgroundCanvas = createCanvas(size, size);
    const backgroundCanvasContext = backgroundCanvas.getContext("2d");

    let parsedGIFBackground = null;
    let gifFrames: any[] = [];

    if (!!this.options.gifBackground) {
      const gif = parseGIF(this.options.gifBackground);
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
      const backgroundImage = await loadImage(this.options.backgroundImage!);

      if (this.options.autoColor) {
        const avgRGB = AwesomeQR._getAverageRGB(backgroundImage);
        this.options.colorDark = `rgb(${avgRGB.r},${avgRGB.g},${avgRGB.b})`;
      }

      backgroundCanvasContext.drawImage(
        backgroundImage,
        0,
        0,
        backgroundImage.width,
        backgroundImage.height,
        0,
        0,
        size,
        size
      );
      backgroundCanvasContext.rect(0, 0, size, size);
      backgroundCanvasContext.fillStyle = backgroundDimming;
      backgroundCanvasContext.fill();
    } else {
      backgroundCanvasContext.rect(0, 0, size, size);
      backgroundCanvasContext.fillStyle = this.options.colorLight!;
      backgroundCanvasContext.fill();
    }

    const alignmentPatternCenters = QRUtil.getPatternPosition(this.qrCode!.typeNumber);

    const dataScale = this.options.components?.data?.scale || defaultScale;
    const dataXyOffset = (1 - dataScale) * 0.5;
    for (let row = 0; row < nCount; row++) {
      for (let col = 0; col < nCount; col++) {
        const bIsDark = this.qrCode!.isDark(row, col);
        const isBlkPosCtr = (col < 8 && (row < 8 || row >= nCount - 8)) || (col >= nCount - 8 && row < 8);
        const isTiming = (row == 6 && col >= 8 && col <= nCount - 8) || (col == 6 && row >= 8 && row <= nCount - 8);
        let isProtected = isBlkPosCtr || isTiming;

        for (let i = 1; i < alignmentPatternCenters.length - 1; i++) {
          isProtected =
            isProtected ||
            (row >= alignmentPatternCenters[i] - 2 &&
              row <= alignmentPatternCenters[i] + 2 &&
              col >= alignmentPatternCenters[i] - 2 &&
              col <= alignmentPatternCenters[i] + 2);
        }

        const nLeft = col * nSize + (isProtected ? 0 : dataXyOffset * nSize);
        const nTop = row * nSize + (isProtected ? 0 : dataXyOffset * nSize);
        mainCanvasContext.strokeStyle = bIsDark ? this.options.colorDark! : this.options.colorLight!;
        mainCanvasContext.lineWidth = 0.5;
        mainCanvasContext.fillStyle = bIsDark ? this.options.colorDark! : "rgba(255, 255, 255, 0.6)";
        if (alignmentPatternCenters.length === 0) {
          if (!isProtected) {
            mainCanvasContext.fillRect(
              nLeft,
              nTop,
              (isProtected ? (isBlkPosCtr ? 1 : 1) : dataScale) * nSize,
              (isProtected ? (isBlkPosCtr ? 1 : 1) : dataScale) * nSize
            );
          }
        } else {
          const inAgnRange = col < nCount - 4 && col >= nCount - 4 - 5 && row < nCount - 4 && row >= nCount - 4 - 5;
          if (!isProtected && !inAgnRange) {
            // if align pattern list is empty, then it means that we don't need to leave room for the align patterns
            mainCanvasContext.fillRect(
              nLeft,
              nTop,
              (isProtected ? (isBlkPosCtr ? 1 : 1) : dataScale) * nSize,
              (isProtected ? (isBlkPosCtr ? 1 : 1) : dataScale) * nSize
            );
          }
        }
      }
    }

    const cornerAlignmentCenter = alignmentPatternCenters[alignmentPatternCenters.length - 1];

    // - PROTECTORS
    const protectorStyle = "rgba(255, 255, 255, 0.6)";

    // - FINDER PROTECTORS
    mainCanvasContext.fillStyle = protectorStyle;
    mainCanvasContext.fillRect(0, 0, 8 * nSize, 8 * nSize);
    mainCanvasContext.fillRect(0, (nCount - 8) * nSize, 8 * nSize, 8 * nSize);
    mainCanvasContext.fillRect((nCount - 8) * nSize, 0, 8 * nSize, 8 * nSize);

    // - TIMING PROTECTORS
    if (this.options.components?.timing?.protectors) {
      mainCanvasContext.fillRect(8 * nSize, 6 * nSize, (nCount - 8 - 8) * nSize, nSize);
      mainCanvasContext.fillRect(6 * nSize, 8 * nSize, nSize, (nCount - 8 - 8) * nSize);
    }

    // - CORNER ALIGNMENT PROTECTORS
    if (this.options.components?.cornerAlignment?.protectors) {
      AwesomeQR._drawAlignProtector(mainCanvasContext, cornerAlignmentCenter, cornerAlignmentCenter, nSize);
    }

    // - ALIGNMENT PROTECTORS
    if (this.options.components?.alignment?.protectors) {
      for (let i = 0; i < alignmentPatternCenters.length; i++) {
        for (let j = 0; j < alignmentPatternCenters.length; j++) {
          const agnX = alignmentPatternCenters[j];
          const agnY = alignmentPatternCenters[i];
          if (agnX === 6 && (agnY === 6 || agnY === cornerAlignmentCenter)) {
            continue;
          } else if (agnY === 6 && (agnX === 6 || agnX === cornerAlignmentCenter)) {
            continue;
          } else if (agnX === cornerAlignmentCenter && agnY === cornerAlignmentCenter) {
            continue;
          } else {
            AwesomeQR._drawAlignProtector(mainCanvasContext, agnX, agnY, nSize);
          }
        }
      }
    }

    // - FINDER
    mainCanvasContext.fillStyle = this.options.colorDark!;
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

    // - TIMING
    const timingScale = this.options.components?.timing?.scale || defaultScale;
    const timingXyOffset = (1 - timingScale) * 0.5;
    for (let i = 0; i < nCount - 8; i += 2) {
      AwesomeQR._drawDot(mainCanvasContext, 8 + i, 6, nSize, timingXyOffset, timingScale);
      AwesomeQR._drawDot(mainCanvasContext, 6, 8 + i, nSize, timingXyOffset, timingScale);
    }

    // - CORNER ALIGNMENT PROTECTORS
    const cornerAlignmentScale = this.options.components?.cornerAlignment?.scale || defaultScale;
    const cornerAlignmentXyOffset = (1 - cornerAlignmentScale) * 0.5;
    AwesomeQR._drawAlign(
      mainCanvasContext,
      cornerAlignmentCenter,
      cornerAlignmentCenter,
      nSize,
      cornerAlignmentXyOffset,
      cornerAlignmentScale,
      this.options.colorDark!
    );

    // - ALIGNEMNT
    const alignmentScale = this.options.components?.alignment?.scale || defaultScale;
    const alignmentXyOffset = (1 - alignmentScale) * 0.5;
    for (let i = 0; i < alignmentPatternCenters.length; i++) {
      for (let j = 0; j < alignmentPatternCenters.length; j++) {
        const agnX = alignmentPatternCenters[j];
        const agnY = alignmentPatternCenters[i];
        if (agnX === 6 && (agnY === 6 || agnY === cornerAlignmentCenter)) {
          continue;
        } else if (agnY === 6 && (agnX === 6 || agnX === cornerAlignmentCenter)) {
          continue;
        } else if (agnX === cornerAlignmentCenter && agnY === cornerAlignmentCenter) {
          continue;
        } else {
          // mainCanvasContext.fillStyle = "rgba(0, 0, 0, .2)";
          AwesomeQR._drawAlign(
            mainCanvasContext,
            agnX,
            agnY,
            nSize,
            alignmentXyOffset,
            alignmentScale,
            this.options.colorDark!
          );
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

    if (!!this.options.logoImage) {
      const logoImage = await loadImage(this.options.logoImage!);

      let logoScale = this.options.logoScale!;
      let logoMargin = this.options.logoMargin!;
      let logoCornerRadius = this.options.logoCornerRadius!;
      if (logoScale <= 0 || logoScale >= 1.0) {
        logoScale = 0.2;
      }
      if (logoMargin < 0) {
        logoMargin = 0;
      }
      if (logoCornerRadius < 0) {
        logoCornerRadius = 0;
      }

      mainCanvasContext.restore();

      const logoSize = viewportSize * logoScale;
      const x = 0.5 * (size - logoSize);
      const y = x;

      mainCanvasContext.fillStyle = "#FFFFFF";
      mainCanvasContext.save();
      AwesomeQR._prepareRoundedCornerClip(
        mainCanvasContext,
        x - logoMargin,
        y - logoMargin,
        logoSize + 2 * logoMargin,
        logoSize + 2 * logoMargin,
        logoCornerRadius
      );
      mainCanvasContext.clip();
      mainCanvasContext.fill();
      mainCanvasContext.restore();

      mainCanvasContext.save();
      AwesomeQR._prepareRoundedCornerClip(mainCanvasContext, x, y, logoSize, logoSize, logoCornerRadius);
      mainCanvasContext.clip();
      mainCanvasContext.drawImage(logoImage, x, y, logoSize, logoSize);
      mainCanvasContext.restore();
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
          gifOutput.setDelay(frame.delay);
          gifOutput.setRepeat(0);
        }

        const { width, height } = frame.dims;
        if (!backgroundCanvas) {
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
        unscaledCanvasContext.rect(0, 0, size, size);
        unscaledCanvasContext.fillStyle = backgroundDimming;
        unscaledCanvasContext.fill();
        unscaledCanvasContext.drawImage(mainCanvas, 0, 0, size, size);

        // Scale the final image
        const outCanvas = createCanvas(rawSize, rawSize);
        const outCanvasContext = outCanvas.getContext("2d");
        outCanvasContext.drawImage(unscaledCanvas, 0, 0, rawSize, rawSize);
        gifOutput.addFrame(outCanvasContext.getImageData(0, 0, outCanvas.width, outCanvas.height).data);
      });

      if (!gifOutput) {
        throw new Error("No frames.");
      }

      gifOutput.finish();

      if (isElement(this.canvas)) {
        const u8array = gifOutput.stream().toFlattenUint8Array();
        const binary = u8array.reduce((bin: string, u8: number) => bin + String.fromCharCode(u8), "");
        return Promise.resolve(`data:image/gif;base64,${window.btoa(binary)}`);
      }

      return Promise.resolve(Buffer.from(gifOutput.stream().toFlattenUint8Array()));
    } else {
      // Swap and merge the foreground and the background
      backgroundCanvasContext.drawImage(mainCanvas, 0, 0, size, size);
      mainCanvasContext.drawImage(backgroundCanvas, -margin, -margin, size, size);

      // Scale the final image
      const outCanvas = createCanvas(rawSize, rawSize); //document.createElement("canvas");
      const outCanvasContext = outCanvas.getContext("2d");
      outCanvasContext.drawImage(mainCanvas, 0, 0, rawSize, rawSize);
      this.canvas = outCanvas;

      if (isElement(this.canvas)) {
        return Promise.resolve(this.canvas.toDataURL());
      }

      return Promise.resolve(this.canvas.toBuffer());
    }
  }
}

function isElement(obj: any): boolean {
  try {
    //Using W3 DOM2 (works for FF, Opera and Chrome)
    return obj instanceof HTMLElement;
  } catch (e) {
    //Browsers not supporting W3 DOM2 don't have HTMLElement and
    //an exception is thrown and we end up here. Testing some
    //properties that all elements have (works on IE7)
    return (
      typeof obj === "object" &&
      obj.nodeType === 1 &&
      typeof obj.style === "object" &&
      typeof obj.ownerDocument === "object"
    );
  }
}
