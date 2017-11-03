# Awesome-qr.js 

[![npm version](https://badge.fury.io/js/awesome-qr.svg)](https://badge.fury.io/js/awesome-qr)
[![license](https://img.shields.io/github/license/SumiMakito/Awesome-qr.js.svg)](https://www.apache.org/licenses/LICENSE-2.0)

An awesome<del>(simple)</del> QR code generator written in JavaScript.

一个优雅的<del>(不起眼的)</del> QR 二维码生成器

### Live demo 在线演示

Check out our **brand-new** [live demo](https://www.bitcat.cc/webapp/awesome-qr/index.html).

來訪問 [最新的演示頁面](https://www.bitcat.cc/webapp/awesome-qr/index.html) 吧！

Or you can also access the live demo by typing `bitcat.cc/awesome` in the browser on your smartphone.

你也可以在手機瀏覽器的地址欄輸入 `bitcat.cc/awesome` 來快速訪問演示頁面。

### Compatibility 兼容性

> Awesome-qr.js is compatible with following browsers.

- Chrome 4+ (Chrome for Android 53+)
- Firefox 3.6+ (Firefox for Android 49+)
- Opera 9+ (Opera Mobile 10+)
- Safari 4+ (iOS Safari 3.2+)
- Android Browser 3+
- Edge 12+
- IE 9+

### Examples 样例

> Try to scan these QR codes below with your smart phone.
> 嘗試用手機掃描下方的二維碼吧~

##### Simple & normal styles

Example 1|Example 2|Example 3
------------ | ------------- | -------------
<img src="https://raw.githubusercontent.com/SumiMakito/Awesome-qr.js/master/art/awesome-qr-1.png" width="350"> | <img src="https://raw.githubusercontent.com/SumiMakito/Awesome-qr.js/master/art/awesome-qr-2.png" width="350"> | <img src="https://raw.githubusercontent.com/SumiMakito/Awesome-qr.js/master/art/awesome-qr-3.png" width="350">

##### With <del>magical</del> extra options

Binarized|With a logo|Custom color|With GIF background
------------ | ------------- | ------------- | -------------
<img src="https://raw.githubusercontent.com/SumiMakito/Awesome-qr.js/master/art/awesome-qr-4.png" width="350"> | <img src="https://raw.githubusercontent.com/SumiMakito/Awesome-qr.js/master/art/awesome-qr-5.png" width="350"> | <img src="https://raw.githubusercontent.com/SumiMakito/Awesome-qr.js/master/art/awesome-qr-6.png" width="350"> | <img src="https://raw.githubusercontent.com/SumiMakito/Awesome-qr.js/master/art/awesome-qr-7.gif" width="350">

### Quick start 快速上手

```
npm install awesome-qr --save
```

```javascript
require(['awesome-qr'], function (awesomeQR) {
    awesomeQR.create({
        text: 'Makito loves Kafuu Chino.',
        size: 800,
        margin: 20,
        backgroundImage: backgroundImg,
        logoImage: logoImg,
        bindElement: 'qrcode'
    });
});
```

... or import the .js file manually as you like, and ...

```javascript
new AwesomeQRCode().create({
    text: 'Makito loves Kafuu Chino.',
    size: 800,
    margin: 20,
    backgroundImage: backgroundImg,
    logoImage: logoImg,
    callback: function(dataURI){
        console.log(dataURI);
    },
    bindElement: 'qrcode'
});
```

```javascript
var img = new Image();
img.crossOrigin = "Anonymous";
img.onload = function() {
    // Use the img
};
img.src = "Some URL";
```

> Please place `gif.js` and `gif.worker.js` together with `awesome-qr(.min).js`. 

> Note that the Image loads images asynchronously; that is to say, you will need to set a callback in order to use the image after it has finished loading. For more information, please follow the issue [#8](https://github.com/SumiMakito/Awesome-qr.js/issues/8).

> When using an animated GIF image as the background, please follow [these steps](#steps-for-applying-a-gif-background-設置-gif-動圖為背景的步驟) in order to use this new feature correctly.

> 請將 `gif.js` 及 `gif.worker.js` 與 `awesome-qr(.min).js` 放在一起。

> 圖像為異步方式載入，因此請留意設置回調函數來取得載入完成的圖像數據。參見 [#8](https://github.com/SumiMakito/Awesome-qr.js/issues/8)。

> 當使用 GIF 動圖作為背景時，請參考[這些步驟](#steps-for-applying-a-gif-background-設置-gif-動圖為背景的步驟)以便正確使用這個新功能。

### Parameters 参数介紹

> Here's a full list of all parameters, but some of them are optional.

> 以下列出全部参数，但其中部分参数是可选的。

```javascript
new AwesomeQRCode().create({
    text: 'Makito loves Kafuu Chino.',
    size: 800,
    margin: 20,
    colorDark: "#000000",
    colorLight: "#ffffff",
    gifBackground: gifBackgroundArrayBuffer,
    backgroundImage: backgroundImg,
    backgroundDimming: 'rgba(0,0,0,0)',
    logoImage: logoImg,
    logoScale: 0.2,
    logoMargin: 6,
    logoCornerRadius: 8,
    whiteMargin: true,
    dotScale: 0.35,
    autoColor: true,
    binarize: false,
    binarizeThreshold: 128,
    callback: function(dataURI){},
    bindElement: 'qrcode'
});
```

Parameter | Explanation
----|----
text | Contents to encode. 欲编码的内容
size | Width as well as the height of the output QR code, includes margin. 尺寸, 长宽一致, 包含外边距
margin | Margin to add around the QR code. 二维码图像的外边距, 默认 20px
colorDark | Color of "true" blocks. Works only when both colorDark and colorLight are set. (BYTE_DTA, BYTE_POS, BYTE_AGN, BYTE_TMG) 实点的颜色
colorLight | Color of empty space, or "false" blocks. Works only when both colorDark and colorLight are set. (BYTE_EPT) 空白区的颜色
backgroundImage | Background image to embed in the QR code. Optional. 欲嵌入的背景图, 可選
gifBackground | GIF background to embed in the QR code. Optional. 欲嵌入的 GIF 背景图, 可選
backgroundDimming | Color mask to add above the background image. Helpful when having problems with decoding. 叠加在背景图上的颜色, 在解码有难度的时有一定帮助
logoImage | Logo image to embed at the center of generated QR code. Leave `undefined` to disable. 欲嵌入至二维码中心的 LOGO 标识, 设为 `undefined` 以禁用
logoScale | Value used to scale the logo image. Larger value may result in decode failure. Size of the logo equals to `logoScale*(size-2*margin)`. Default is 0.2f. 用于计算 LOGO 大小的值, 过大将导致解码失败, LOGO 尺寸计算公式 `logoScale*(size-2*margin)`, 默认 0.2f
logoMargin | White margin that appears around the logo image. Leave 0 to disable. LOGO 标识周围的空白边框, 设为 0 以禁用
logoCornerRadius | Radius of the logo's corners. Leave 0 to disable. LOGO 标识及其边框的圆角半径, 设为 0 以禁用
whiteMargin | If set to true, a white border will appear around the background image. Default is true. 若设为 true, 背景图外将绘制白色边框
dotScale | Value used to scale down the data dots' size. (0 < scale <= 1.0) 数据区域点缩小比例
autoColor | If set to true, the dominant color of backgroundImage will be used as colorDark. Default is true. 若为 true, 背景图的主要颜色将作为实点的颜色, 即 colorDark
binarize | If set to true, the whole image will be binarized with the given threshold, or default threshold if not specified. Default is false. 若为 true, 图像将被二值化处理, 未指定阈值则使用默认值
binarizeThreshold | Threshold used to binarize the whole image. Default is 128. (0 < threshold < 255) 二值化处理的阈值
callback | Data URI of the generated QR code will be available here. 生成的二维码 Data URI 可以在回调中取得
bindElement | Element to inject the generated QR code into. MUST be the ID of the target element. (without the "#" prefix). Element type can be `<div>`, `<img>`, etc.

### Steps for applying a GIF background 設置 GIF 動圖為背景的步驟

Note that the option `gifBackground` in Awesome-qr.js only accepts ArrayBuffer, which represents a GIF image. Thus some conversions need to be done before generating the QR code.

請注意 `gifBackground` 這個選項只接收 ArrayBuffer 類型的數據，GIF 圖像也將由 ArrayBuffer 代表。因此在生成二維碼之前，有一些轉換工作需要完成。

e.g.

```javascript
var r = new FileReader();
r.onload = function (e) {
    var ab = e.target.result;
};
r.readAsArrayBuffer(file);
```

> To read a file into an ArrayBuffer. 將文件讀取至 ArrayBuffer。

```javascript
var options = {
    text: 'Makito loves Kafuu Chino.',
    size: 600,
    margin: 20,
    gifBackground: ab,
    bindElement: 'qrcode',
    callback: function (data) {
        // use the data url
    }
};
awesomeQR.create(options);
```

> Generate the QR code with the ArrayBuffer of GIF. 使用代表 GIF 的 ArrayBuffer 來生成二維碼。

It usually takes a longer time to decode and encode the GIF, and generate an animated QR code, but it depends on the size of the input file.

通常解碼編碼 GIF 以及生成二維碼會花費更多時間，取決於輸入文件的大小。

### Support me 支持開發者

If you really like Awesome-qr.js, please consider making a donation to support me. Thanks!

如果您喜歡我的作品，歡迎通過捐贈的方式來支持我。

您可以於 支付寶 中檢索 `sumimakito` 或點按下方連結。

You can find me by searching `sumimakito` in Alipay on Android/iOS devices, or click the links below.

- [PayPal](https://www.paypal.me/makito)
- [Alipay 支付寶](https://qr.alipay.com/a6x02021re1jk4ftcymlw79)

Also, you can try to scan the following QR code with Alipay.

您也可以使用手機掃描下方的二維碼來找到我。

<img src="https://raw.githubusercontent.com/SumiMakito/Misc/master/alipay-2.jpg" width="300">

### Changelog 更新日志

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

- Published to NPM.
- Now background images can be binarized.

##### Ver 1.0.0

- Initial release.

### Introducing EFQRCode written in Swift

EFQRCode is a tool to generate QRCode image or recognize QRCode from image, in Swift.

Awesome-qr.js is inspired by [EFQRCode by EyreFree](https://github.com/EyreFree/EFQRCode).

If your application is in need of generating pretty QR codes in Swift, take a look at EFQRCode.

It should help.

### AwesomeQRCode written for Android, 支持 Android 的 AwesomeQRCode

Redirect to [AwesomeQRCode](https://github.com/SumiMakito/AwesomeQRCode).

### Vue 2.x Component for Awesome-qr.js

[Vue-qr](https://github.com/Binaryify/vue-qr).

### Copyright &amp; License, 版权信息与授权协议

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
