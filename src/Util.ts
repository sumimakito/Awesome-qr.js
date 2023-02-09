/* global document */
export const isNode = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;

export const isSvgFile = (src: string) => {
        return new Promise((resolve, reject) => {
            const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
            const http = new XMLHttpRequest();
            http.open('HEAD', src);
            http.onreadystatechange = function() {
                if (this.readyState === this.DONE) {
                    resolve(this.getResponseHeader('content-type').indexOf('svg') !== -1)
                }
            };
            http.send();
        });
};


export const getFrameTextSize = (configSize: number, textLength: number) => {
    let factor;

    if (textLength >= 0 && textLength <= 12) {
        factor = 10;
    } else if (textLength <= 16) {
        factor = 13;
    } else if (textLength <= 20) {
        factor = 16;
    } else if (textLength <= 24) {
        factor = 17;
    }  else if (textLength <= 27) {
        factor = 19;
    } else if (textLength <= 30) {
        factor = 20;
    } else {
        throw new Error('Frame text should be between 0 to 30 characters')
    }
    return configSize / factor;
};