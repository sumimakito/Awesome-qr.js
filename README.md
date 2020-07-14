# Awesome-qr.js 

[![npm version](https://badge.fury.io/js/awesome-qr.svg)](https://badge.fury.io/js/awesome-qr)
[![license](https://img.shields.io/github/license/SumiMakito/Awesome-qr.js.svg)](https://www.apache.org/licenses/LICENSE-2.0)

An awesome<del>(simple)</del> QR code generator written in JavaScript.

[点此阅读简体中文版本文档](README-zh_CN.md)

### Live demo

Check out our [**brand-new** live demo](https://www.bitcat.cc/webapp/awesome-qr/index.html).

Or you can also access the live demo by typing `bitcat.cc/awesome` in the browser on your smartphone.

### Compatibility

> Awesome-qr.js is compatible with following browsers.

- Chrome 4+ (Chrome for Android 53+)
- Firefox 3.6+ (Firefox for Android 49+)
- Opera 9+ (Opera Mobile 10+)
- Safari 4+ (iOS Safari 3.2+)
- Android Browser 3+
- Edge 12+
- IE 9+

### Gallery

These QR codes were made with Awesome-qr.js

<!-- --> | <!-- --> | <!-- -->
------------ | ------------- | -------------
<img src="art/gallery-1.png" width="350"> | <img src="art/gallery-2.png" width="350"> | <img src="art/gallery-3.gif" width="350">

### Play with Awesome-qr.js

> Note: Module 'awesome-qr' on npmjs has been totally changed after v1.2.0.

#### α. Use in Node.js (on server side)

> **IMPORTANT**: Awesome-qr.js uses node-canvas to draw the generated QR code image, so before running the `npm install ...` command, you really should take a carefully look at [its documentation](https://github.com/Automattic/node-canvas#installation) to ensure that node-canvas will work on your server correctly.

```
npm install awesome-qr --save
```

> Before V1.2.0, Awesome-qr.js was NOT designed for servers running Node.js. Therefore, please do NOT use npm to install versions below V1.2.0 on your server, you may get a painful error otherwise.

```javascript
let AwesomeQR = require('awesome-qr');

new AwesomeQR().create({
	text: 'Makito loves Kafuu Chino.',
	size: 500,
	callback: (data) => {
	    // binary PNG data
	}
});
```

#### β. Use in the browser

> Note: There's **no need to** use npmjs. We **just need** require.js here.

Copy JavaScript files under `dist/` to a appropriate place, for example – `js/`.

The file structure might look like the tree below:

```
|- ...
|- index.html
|- js
    |- awesome-qr.js
    |- gif.js
    |- gif.worker.js
    |- require.js
|- ...
```

Import require.js:

```html
<script type="text/javascript" src="js/require.js"></script>
```

Then, require awesome-qr.js:

```javascript
// This will specify the base path for awesome-qr.js, gif.js, and gif.worker.js. 
// In the case showed above, the base path should be "js".
// The variable's name should NOT be changed.
var __awesome_qr_base_path = "js"; 

// require awesome-qr.js
require([__awesome_qr_base_path + '/awesome-qr'], function (AwesomeQR) {
	// ... and make use of it
	AwesomeQR.create({
		text: 'Makito loves Kafuu Chino.',
		size: 800,
		margin: 20,
		bindElement: 'qrcode'
	});
});
```
### More examples

#### 1. With a background image

##### α. Use in Node.js (on server side)

```javascript
let request = require('request');
let AwesomeQR = require('awesome-qr');
const {Image} = require('canvas');

let options = {
    url: "https://avatars3.githubusercontent.com/u/5277268?s=460&v=4",
    method: 'GET',
    encoding: null
    // ^ this is necessary since we are not going to
    //   get the image as a string.
};

request.get(options, (error, response, body) => {
	if (!error && response.statusCode === 200) {
		// load the background image
		let backgroundImage = new Image;
		backgroundImage.src = body;
		
		new AwesomeQR().create({
			text: 'Makito loves Kafuu Chino.',
			size: 500,
			backgroundImage: backgroundImage,
			autoColor: true,
			callback: (data) => {
		    	if (data === undefined) {
		    		console.log('failed to generate the QR code');
				} else {
					// play with binary PNG data
				}
			}
		});
	} else {
		console.log('failed to get the background image');
	}
});
```

> Note: Background images **other than PNG** is **not supported** under Node.js mode. You may get a `Error: Image given has not completed loading` error if you are using other image formats.

##### β. Use in the browser

```javascript
var img = new Image();
img.crossOrigin = "Anonymous";
img.onload = () => {
	AwesomeQR.create({
		text: 'Makito loves Kafuu Chino.',
		size: 800,
		margin: 20,
		backgroundImage: img,
		bindElement: 'qrcode'
	});
};
img.src = "https://avatars3.githubusercontent.com/u/5277268?s=460&v=4";

```

> Note that the Image loads images asynchronously; that is to say, you will need to set a callback in order to use the image after it has finished loading. For more information, please follow the issue [#8](https://github.com/SumiMakito/Awesome-qr.js/issues/8).


#### 2. With a logo image at center

##### α. Use in Node.js (on server side)

Not yet supported.

##### β. Use in the browser

```javascript
var logo = new Image();
logo.crossOrigin = "Anonymous";
logo.onload = () => {
	AwesomeQR.create({
		text: 'Makito loves Kafuu Chino.',
		size: 800,
		margin: 20,
		logoImage: logo,
		bindElement: 'qrcode'
	});
};
logo.src = "https://avatars3.githubusercontent.com/u/5277268?s=460&v=4";
```

#### 3. Use a GIF image as background

##### α. Use in Node.js (on server side)

Not yet supported.

##### β. Use in the browser

Note that the option `gifBackground` only accepts ArrayBuffer, which represents a GIF image's data. Some conversions need to be done before generating the QR code.

```javascript
// initialize a FileReader
var r = new FileReader();

// set up an onload listener
r.onload = function (e) {
	// get the ArrayBuffer
    var ab = e.target.result;
    
    AwesomeQR.create({
		text: 'Makito loves Kafuu Chino.',
		size: 800,
		margin: 20,
		gifBackground: ab, 
		// ^ use the ArrayBuffer
		bindElement: 'qrcode'
	});
};

// read as ArrayBuffer
r.readAsArrayBuffer(file);
```

> When `gifBackground` is in use, the `backgroundImage` option will be ignored.

It usually takes a longer time to decode and encode the GIF, and generate an animated QR code, but it depends on the size of the input file.

### Options

#### Basic

Option | Client-side (browsers) | Server-side (Node.js)
:------|:-----------------------|:---------------------
text | Required | Required
size | Required | Required
margin | Optional | Optional
dotScale | Optional | Optional
maskedDots | Optional | Not supported
correctLevel | Optional | Optional
whiteMargin | Optional | Optional
bindElement | Optional | Not supported
callback | Optional | Optional

> At here, you can use `bindElement` to specify the id (without the leading #) of the element you want to fill the generated QR code image into. Element can be a `<div>` or a `<img>`.

> The option `maskedDots ` is experimental.

#### Color scheme

Option | Client-side (browsers) | Server-side (Node.js)
:------|:-----------------------|:---------------------
colorDark | Optional | Optional
colorLight | Optional | Optional
autoColor | Optional | Optional

> If `autoColor` is set, `colorDark` and `colorLight` will be ignored.

#### Background image

Option | Client-side (browsers) | Server-side (Node.js)
:------|:-----------------------|:---------------------
backgroundImage | Optional | Optional
backgroundDimming | Optional | Optional
gifBackground | Optional | Not supported

> If `gifBackground ` is set, `backgroundImage ` will be ignored.

#### Logo image

Option | Client-side (browsers) | Server-side (Node.js)
:------|:-----------------------|:---------------------
logoImage | Optional | Not supported
logoScale | Optional | Not supported
logoMargin | Optional | Not supported
logoCornerRadius | Optional | Not supported

> Actual size for the logo will be `logoScale*(size-2*margin)`.

#### Post-processing

Option | Client-side (browsers) | Server-side (Node.js)
:------|:-----------------------|:---------------------
binarize | Optional | Not supported
binarizeThreshold | Optional | Not supported

> Value of `binarizeThreshold ` should be an integer greater than 0 and less than 255.

#### Extra: Default option

Awesome-qr.js will use the values below for the missing fields in the custom option.

```
{
	size: 800,
	margin: 20,
	dotScale: 0.35,
	whiteMargin: true,
	colorDark: "#000000",
	colorLight: "#ffffff",
	autoColor: true,
	maskedDots: false,
	correctLevel: QRErrorCorrectLevel.M,
	backgroundImage: undefined,
	backgroundDimming: 'rgba(0,0,0,0)',
	gifBackground: undefined,
	logoImage: undefined,
	logoScale: 0.2,
	logoMargin: 6,
	logoCornerRadius: 8,
	binarize: false,
	binarizeThreshold: 128,
	callback: undefined,
	bindElement: undefined
}
```

### Sponsors

It is those generous sponsors who supports this project makes the Awesome-qr.js more awesome!

I'd like to express my sincere appreciation to all the generous sponsors.

- [Coxxs](https://coxxs.me/)       

Since sponsors' names will not show up here without their permissions, the list above only shows a part of all the sponsors. If you wish to have your name shown up here, please feel free to contact me.
                        
### Support me

If you really like Awesome-qr.js, please consider making a donation to support me. Thanks!

You can find me by searching `sumimakito` in Alipay on Android/iOS devices, or click the links below.

- [PayPal](https://www.paypal.me/makito)
- [Alipay](https://qr.alipay.com/a6x02021re1jk4ftcymlw79)

Also, you can try to scan the following QR code with Alipay or WeChat.

<img src="https://raw.githubusercontent.com/SumiMakito/Misc/master/alipay-2.jpg" width="300">

<img src="https://raw.githubusercontent.com/SumiMakito/Misc/master/wechat-2.png" width="300">

### Changelog

##### Ver. 1.2.0

- Added the support for Node.js.

##### Ver. 1.1.0

- Added the support for GIF backgrounds.

##### Ver. 1.0.10

- Fixed a bug in the core library which would cause the too-early overflow.

##### Ver. 1.0.9

- Fixed a bug which would leave an empty space on the simple QRCode image which has no alignment patterns.

![](art/bug-fix-1.0.9.png)

##### Ver. 1.0.8

- Fixed a bug which would leave white stripes between neighboring blocks while drawing QRCode at scale ```1.0```.

![](art/bug-fix-1.0.8.png)

##### Ver. 1.0.7

- Minor fixes.

##### Ver. 1.0.6

- Fixed an issue related to the coordinate system.

##### Ver. 1.0.5

- Now you may use Awesome-qr.js with [require.js](http://requirejs.org/).
- New feature: Embedding a logo image in the QR code.
- Added some features which previously only available on Android platform.

##### Ver. 1.0.4

- Compatibility improved.

##### Ver. 1.0.3

- Now generated QR codes can be automatically filled into specified elements.

##### Ver. 1.0.2, 1.0.1

- Published to npmjs.
- Now background images can be binarized.

##### Ver 1.0.0

- Initial release.

### Special thanks

Awesome-qr.js is inspired by [EFQRCode by EyreFree](https://github.com/EyreFree/EFQRCode).

EFQRCode is a tool to generate QRCode image or recognize QRCode from image, in Swift.

If your application is in need of generating pretty QR codes in Swift, take a look at EFQRCode. It should help.

### AwesomeQRCode: Designed for Android

Also, if you are developing Android apps, you can take a look at [AwesomeQRCode](https://github.com/SumiMakito/AwesomeQRCode), which is designed for Android projects.

### Other versions

- Vue 2.x component: [Vue-qr](https://github.com/Binaryify/vue-qr)

### Copyright &amp; License

Copyright &copy; 2017 Sumi Makito

Licensed under Apache License 2.0 License.

```
Copyright (c) 2017 Sumi Makito, https://www.keep.moe

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