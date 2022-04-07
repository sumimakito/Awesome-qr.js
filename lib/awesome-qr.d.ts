/// <reference types="node" />
export declare type ComponentOptions = {
    /**
     * Component options for data/ECC.
     */
    data?: {
        /**
         * Scale factor for data/ECC dots.
         * @default 1
         */
        scale?: number;
    };
    /**
     * Component options for timing patterns.
     */
    timing?: {
        /**
         * Scale factor for timing patterns.
         * @default 1
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
         * @default 1
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
         * @default 1
         */
        scale?: number;
        /**
         * Protector for alignment pattern on the bottom-right corner.
         * @default true
         */
        protectors?: boolean;
    };
};
export declare type Options = {
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
     * Logo image to be displayed at the center of the QR code.
     *
     * Accepts a `data:` string in web browsers or a Buffer in Node.js.
     *
     * When set to `undefined` or `null`, the logo is disabled.
     *
     * @defaultValue undefined
     */
    logoImage?: string | Buffer;
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
};
export declare class AwesomeQR {
    private canvas;
    private canvasContext;
    private qrCode?;
    private options;
    static CorrectLevel: {
        L: number;
        M: number;
        Q: number;
        H: number;
    };
    private static defaultComponentOptions;
    static defaultOptions: Options;
    constructor(options: Partial<Options>);
    draw(): Promise<Buffer | ArrayBuffer | string | undefined>;
    private _clear;
    private static _prepareRoundedCornerClip;
    private static _getAverageRGB;
    private static _drawDot;
    private static _drawAlignProtector;
    private static _drawAlign;
    private _draw;
}
