/* global document */

import { Image as ImageCanvas } from 'canvas';

const isNode = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;

export const loadImage = (src: string, imageServerURL?: string | undefined, imageServerRequestHeaders?: object | undefined) => {
    if (imageServerURL && !isNode) {
        return new Promise((resolve, reject) => {
            if (isNode) {
                // TODO: Handle node
                // const rp = require('request-promise');
                // const options = {
                //     uri: imageServerURL + `?url=${src}`,
                //     headers: imageServerRequestHeaders,
                //     json: false, // Automatically parses the JSON string in the response
                //     encoding: null,
                // };
                // // @ts-ignore
                // rp(options).then(res => {
                //     const img = new ImageCanvas();
                //     img.src = 'data:image/jpeg;base64,' + res.toString('base64');
                //     resolve(img);
                //     // @ts-ignore
                // }, error => {
                //     reject(error);
                // });
            } else {
                const xhttp = new XMLHttpRequest();
                xhttp.responseType = 'blob';
                xhttp.onreadystatechange = function() {
                    if (this.readyState === 4 && (this.status >= 200 && this.status < 300)) {
                        const imageURL = window.URL.createObjectURL(xhttp.response);
                        const img = document.createElement('img');
                        img.crossOrigin = 'anonymous';

                        img.onerror = (err: any) => {
                            reject(err);
                        };
                        img.onload = () => {
                            resolve(img);
                        };
                        img.src = imageURL;
                    } else if (this.readyState === 4 && this.status >= 400 && this.status < 500) {
                        reject();
                    } else if (this.status >= 500 && this.status < 600) {
                        reject();
                    }
                };
                xhttp.open('GET', imageServerURL + `?url=${src}`, true);
                if (imageServerRequestHeaders) {
                    // @ts-ignore
                    xhttp.setRequestHeader('Authorization', imageServerRequestHeaders.authorization);
                }
                xhttp.send();
            }
        });
    }
    let image: any;
    if (isNode) {
        image = new ImageCanvas();
    } else {
        image = document.createElement('img');
        image.crossOrigin = 'anonymous';
    }

    return new Promise((resolve, reject) => {
        function cleanup() {
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
