export enum QRMode {
    MODE_NUMBER = 1 << 0,
    MODE_ALPHA_NUM = 1 << 1,
    MODE_8BIT_BYTE = 1 << 2,
    MODE_KANJI = 1 << 3,
}

export enum QRErrorCorrectLevel {
    L = 1,
    M = 0,
    Q = 3,
    H = 2,
}

export enum QRMaskPattern {
    PATTERN000 = 0,
    PATTERN001,
    PATTERN010,
    PATTERN011,
    PATTERN100,
    PATTERN101,
    PATTERN110,
    PATTERN111,
}

export enum CanvasType {
    PDF = 'pdf',
    SVG = 'svg',
    JPEG = 'jpeg',
    PNG = 'png',
}

export enum EyeFrameShape {
    SQUARE = 'square',
    CIRCLE = 'circle',
    ROUNDED = 'rounded',
    LEFT_LEAF = 'left-leaf',
    RIGHT_LEAF = 'right-leaf',
}

export enum EyeBallShape {
    SQUARE = 'square',
    CIRCLE = 'circle',
    ROUNDED = 'rounded',
    LEFT_LEAF = 'left-leaf',
    RIGHT_LEAF = 'right-leaf',
    LEFT_DIAMOND = 'left-diamond',
    RIGHT_DIAMOND = 'right-diamond',
}

export enum DataPattern {
    SQUARE = 'square',
    CIRCLE = 'circle',
    KITE = 'kite',
    LEFT_DIAMOND = 'left-diamond',
    RIGHT_DIAMOND = 'right-diamond',
    THIN_SQUARE = 'thin-square',
    SMOOTH_ROUND = 'smooth-round',
    SMOOTH_SHARP = 'smooth-sharp'

}

export enum GradientType {
    NONE = 'none',
    LINEAR = 'linear',
    RADIAL = 'radial',
    VERTICAL = 'vertical',
    HORIZONTAL = 'horizontal',
}

export enum QRCodeFrame {
    NONE = 'none',
    BOX_BOTTOM = 'box-bottom',
    BOX_TOP = 'box-top',
    BANNER_TOP = 'banner-top',
    BANNER_BOTTOM = 'banner-bottom',
    BALLOON_BOTTOM = 'balloon-bottom',
    BALLOON_TOP = 'balloon-top',
    CIRCULAR = 'circular',
    TEXT_ONLY = 'text-only',
    FOCUS = 'focus'
    // BOX_LIGHT = 'box-light',
}


