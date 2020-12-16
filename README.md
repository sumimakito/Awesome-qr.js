# Awesome-qr.js <!-- omit in toc -->

[![npm version](https://badge.fury.io/js/awesome-qr.svg)](https://badge.fury.io/js/awesome-qr)
[![license](https://img.shields.io/github/license/SumiMakito/Awesome-qr.js.svg)](https://www.apache.org/licenses/LICENSE-2.0)

An awesome<del>(simple)</del> QR code generator written in JavaScript.

## Gallery <!-- omit in toc -->

> These QR codes were made with Awesome-qr.js 🤗

<table>
	<tr>
		<td valign="top"><img src="art/gallery-1.png" width="350"></td>
    	<td valign="top"><img src="art/gallery-2.png" width="350"></td>
    	<td valign="top"><img src="art/gallery-3.gif" width="350"></td>
  	</tr>
</table>

## Contents <!-- omit in toc -->

- [Getting Started](#getting-started)
  - [Node.js](#nodejs)
  - [Browsers](#browsers)
- [Options](#options)
  - [text](#text)
  - [size](#size)
  - [margin](#margin)
  - [typeNumber](#typenumber)
  - [correctLevel](#correctlevel)
  - [colorDark](#colordark)
  - [colorLight](#colorlight)
  - [autoColor](#autocolor)
  - [backgroundImage](#backgroundimage)
  - [backgroundDimming](#backgrounddimming)
  - [gifBackground](#gifbackground)
  - [whiteMargin](#whitemargin)
  - [dotScale](#dotscale)
  - [logoImage](#logoimage)
  - [logoScale](#logoscale)
  - [logoMargin](#logomargin)
  - [logoCornerRadius](#logocornerradius)
- [Sponsors](#sponsors)
- [Changelog](#changelog)
- [Special thanks](#special-thanks)
- [AwesomeQRCode: Designed for Android](#awesomeqrcode-designed-for-android)
- [Other versions](#other-versions)
- [Copyright &amp; License](#copyright--license)

## Getting Started

### Node.js

Type definitions are included in the npm package.

> **Please read ⚠️**
>
> Awesome-qr.js uses node-canvas as its drawing backend. You might need to take a look at [its documentation](https://github.com/Automattic/node-canvas#installation) to ensure that node-canvas works on your environment.

```shell
yarn add awesome-qr // using Yarn
npm install --save awesome-qr // using NPM
```

> Awesome-qr.js prior to v2.0.0 **does not work well** in Node.js environment and Awesome-qr.js prior to v1.2.0 **does not work** in Node.js environment.

```js
const { AwesomeQR } = require("awesome-qr");
const fs = require("fs");

// ...

const background = fs.readFileSync("background.png");

const buffer = await new AwesomeQR({
  text: "AwesomeQR by Makito - Awesome, right now.",
  size: 500,
  backgroundImage: background,
}).draw();

fs.writeFileSync("qrcode.png", buffer);
```

### Browsers

```html
<!-- import to the global scope -->
<script src="dist/awesome-qr.js"></script>

<!-- or use require.js -->
<script>
  require(["dist/awesome-qr.js"], (AwesomeQR) => ...);
</script>
```

```js
var background;
var reader = new FileReader();
reader.onload = function () {
  background = this.result;
  new AwesomeQR({
    text: "AwesomeQR by Makito - Awesome, right now.",
    size: 500,
    backgroundImage: background,
  }).draw().then((dataURL) => );
};
reader.readAsDataURL(file);
```

## Options

> _Options_ is an object that you can pass to the generator to customize your QR code.

```ts
Options {
  text: string;
  size?: number;
  margin?: number;
  typeNumber?: number;
  correctLevel?: number;
  dotScale?: number;
  colorDark?: string;
  colorLight?: string;
  autoColor?: boolean;
  backgroundImage?: string | Buffer;
  backgroundDimming?: string;
  gifBackground?: ArrayBuffer;
  whiteMargin?: boolean;
  logoImage?: string | Buffer;
  logoScale?: number;
  logoMargin?: number;
  logoCornerRadius?: number;
};
```

### text

`string`

Text to be encoded in the QR code.

### size

`number?, default: 800`

Size of the QR code in pixel.

### margin

`number?, default: 20`

Size of margins around the QR code body in pixel.

### typeNumber

`number?, default: 4`

> For more information, please refer to [Types of QR Code | QRcode.com | DENSO WAVE](https://www.qrcode.com/en/codes/).

Type number of the QR code.

### correctLevel

`number?, default: QRErrorCorrectLevel.M = 0`

> For more information, please refer to [Error correction feature | QRcode.com | DENSO WAVE](https://www.qrcode.com/en/about/error_correction.html).

Error correction level of the QR code.

### colorDark

`string?, CSS <color>, default: "#000000"`

> For more information about CSS &lt;color&gt;, please refer to [&lt;color&gt; - CSS: Cascading Style Sheets | MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value)

Color of the blocks on the QR code.

### colorLight

`string?, CSS <color>, default: "#ffffff"`

Color of the empty areas on the QR code.

### autoColor

`boolean?, default: true`

Automatically calculate the _colorDark_ value from the QR code's background.

### backgroundImage

`(string|Buffer)?, default: undefined`

Background image to be used in the QR code.

Accepts a `data:` string in web browsers or a Buffer in Node.js.

### backgroundDimming

`string?, CSS <color>, default: "rgba(0, 0, 0, 0)"`

Color of the dimming mask above the background image.

### gifBackground

`ArrayBuffer?, default: undefined`

GIF background image to be used in the QR code.

### whiteMargin

`boolean?, default: true`

Use a white margin instead of a transparent one which reveals the background of the QR code on margins.

### dotScale

`number?, default: 0.35`

Ratio of the real size to the full size of the blocks.

This can be helpful when you want to make more parts of the background visible.

### logoImage

`(string|Buffer)?, default: undefined`

Logo image to be displayed at the center of the QR code.

Accepts a `data:` string in web browsers or a Buffer in Node.js.

When set to `undefined` or `null`, the logo is disabled.

### logoScale

`number?, default: 0.2`

Ratio of the logo size to the QR code size.

### logoMargin

`number?, default: 6`

Size of margins around the logo image in pixels.

### logoCornerRadius

`number?, default: 8`

Corner radius of the logo image in pixels.

## Sponsors

It is those generous sponsors who supports this project makes the Awesome-qr.js more awesome!

I'd like to express my sincere appreciation to all the generous sponsors.

- [Coxxs](https://coxxs.me/)

Since sponsors' names will not show up here without their permissions, the list above only shows a part of all the sponsors. If you wish to have your name shown up here, please feel free to contact me.

## Changelog

[Check the full changelog](CHANGELOG.md)

## Special thanks

Awesome-qr.js is inspired by [EFQRCode by EyreFree](https://github.com/EyreFree/EFQRCode).

EFQRCode is a tool to generate QRCode image or recognize QRCode from image, in Swift.

If your application is in need of generating pretty QR codes in Swift, take a look at EFQRCode. It should help.

## AwesomeQRCode: Designed for Android

Also, if you are developing Android apps, you can take a look at [AwesomeQRCode](https://github.com/SumiMakito/AwesomeQRCode), which is designed for Android projects.

## Other versions

- Vue 2.x component: [Vue-qr](https://github.com/Binaryify/vue-qr)

## Copyright &amp; License

Copyright &copy; 2017-2020 Sumi Makito

Awesome-qr.js is licensed under Apache License 2.0 License.

```
Copyright (c) 2017-2020 Sumi Makito, https://www.keep.moe

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

```
jquery-qrcode
Copyright (c) 2011 Jerome Etienne, http://jetienne.com

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```

```
QRCode for JavaScript
Copyright (c) 2009 Kazuhiko Arase
URL: http://www.d-project.com/
Licensed under the MIT license:
    http://www.opensource.org/licenses/mit-license.php
The word "QR Code" is registered trademark of
DENSO WAVE INCORPORATED
    http://www.denso-wave.com/qrcode/faqpatent-e.html
```
