# Awesome-qr.js [![npm version](https://badge.fury.io/js/awesome-qr.svg)](https://badge.fury.io/js/awesome-qr)

An awesome<del>(simple)</del> QR code generator written in JavaScript.

一个优雅的<del>(不起眼的)</del> QR 二维码生成器

### Live demo, 演示网页

Take a look at the [live demo](https://www.bitcat.cc/webapp/awesome-qr/index.html).

### Examples, 样例

> Try to scan these QR codes below with your smart phone.

Example 1|Example 2|Example 3
------------ | ------------- | -------------
<img src="https://raw.githubusercontent.com/SumiMakito/Awesome-qr.js/master/art/awesome-qr-1.png" width="400"> | <img src="https://raw.githubusercontent.com/SumiMakito/Awesome-qr.js/master/art/awesome-qr-2.png" width="400"> | <img src="https://raw.githubusercontent.com/SumiMakito/Awesome-qr.js/master/art/awesome-qr-3.png" width="400">

### Quick start, 快速上手

```
npm install awesome-qr --save
```

... or import the .js file manually as you like.

**ATTENTION PLEASE:**
Parameter list has been changed in Version 1.0.3.

```java
new AwesomeQRCode(
    {
        text: "Makito loves Kafuu Chino.",  // Contents to encode. 欲编码的内容
        width: 800,                         // Width, should equal to height. 宽度, 宽高应当一致
        height: 800,                        // Height, should equal to width. 高度, 宽高应当一致
        colorDark: "#000000",               // Color of blocks. Will be OVERRIDE by autoColor. 实点的颜色
        colorLight: "#FFFFFF",              // Color of empty space. Will be OVERRIDE by autoColor. 空白点的颜色
        correctLevel: AwesomeQRCode.CorrectLevel.H, 
        backgroundImage: backgroundImg,     // Optional. The background image to embed in the QR code. If undefined, no background image will be embedded. 欲嵌入的背景图
        autoColor: true                     // If true, colorDark will be set to the dominant color of backgroundImage. Default is true. 若为 true, 则将从背景图取主要颜色作为实点颜色
        binarize: false,                    // Optional. If true, background image will be binarized. Default is false.
        binarizeThreshold: 128              // Optional. Threshold for binarizing.
        callback: function(dataUri){        //
            ...                             // Optional. You can get the data URI of the generated QR code here. 
        },                                  //
        bindElement: 'qrcode'               // Optional. MUST be the ID of the target element. (without "#" prefix used in jQuery). Element type can be <div>, <img>, etc.
    }
);
```

> If you'd like to try out the new options add in v1.0.3, explore the source code of [this page](https://www.bitcat.cc/webapp/awesome-qr/index2.html).

### Introducing EFQRCode written in Swift

EFQRCode is a tool to generate QRCode image or recognize QRCode from image, in Swift.

Awesome-qr.js is inspired by [EFQRCode by EyreFree](https://github.com/EyreFree/EFQRCode).

If your application is in need of generating pretty QR codes in Swift, take a look at EFQRCode.

It should help.

### AwesomeQRCode written for Android, 支持 Android 的 AwesomeQRCode

Redirect to [AwesomeQRCode](https://github.com/SumiMakito/AwesomeQRCode).

### Vue 2.x Component for Awesome-qr.js

Take a look at [Vue-qr by Binaryify](https://github.com/Binaryify/vue-qr).

### Would you like to buy me a cup of cappuccino? 要请我喝一杯卡布奇诺吗？
PayPal | Alipay
----|----
[PayPal](https://www.paypal.me/makito) | [Alipay](https://qr.alipay.com/a6x02021re1jk4ftcymlw79)

### Changelog 更新日志

##### Ver. 1.0.3

- Now generated QR codes can be automatically filled into specified elements.

##### Ver. 1.0.2, 1.0.1

- Published to NPM.
- Now background images can be binarized.

##### Ver 1.0.0

- Initial release.

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
