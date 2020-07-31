/* global document */

import { Image as ImageCanvas } from 'canvas';

export const isNode = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;

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


export const cellPhoneSVGPath = `<?xml version="1.0" encoding="iso-8859-1"?>
<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="<<x-axis>>" y="<<y-axis>>"
	 width="<<width>>" height="<<height>>" viewBox="0 0 792 792" style="enable-background:new 0 0 792 792;" xml:space="preserve">
<g>
	<path fill="#ffffff" d="M557.75,792c0,0,71.889,0,71.889-71.997V71.997C629.639,0,557.75,0,557.75,0h-323.5c0,0-71.889,0-71.889,71.997v648.006
		C162.361,792,234.25,792,234.25,792H557.75z M396,762.022c-19.841,0-35.944-16.104-35.944-35.944
		c0-19.842,16.103-35.944,35.944-35.944s35.945,16.103,35.945,35.944C431.945,745.919,415.842,762.022,396,762.022z M306.139,43.888
		c0-4.457,3.559-7.944,7.944-7.944h163.8c4.385,0,7.979,3.559,7.979,7.944v2.121c0,4.493-3.559,7.944-7.943,7.944H314.083
		c-4.349,0-7.944-3.559-7.944-7.944V43.888z M198.306,89.861h395.389v575.111H198.306V89.861z"/>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
</svg>
`;
