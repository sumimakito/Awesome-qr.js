/* global document */

import {Image as ImageCanvas} from "canvas";

const isNode = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;

export const loadImage = (src: string) => {
    let image: any;
    if (isNode) {
        image = new ImageCanvas();
    }
    else {
        image = document.createElement("img");
        image.crossOrigin = 'Anonymous';
    }

    return new Promise((resolve, reject) => {
        function cleanup () {
            image.onload = null;
            image.onerror = null;
        }

        image.onerror = (err: any) => {
            cleanup();
            reject(err);
        };

        image.onload = () => {
            cleanup();
            resolve(image);
        };

        image.src = src;
    });
};