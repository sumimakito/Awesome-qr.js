# Awesome-qr.js

An awesome<del>(simple)</del> QR code generator written in JavaScript.

一个优雅的<del>(不起眼的)</del> QR 二维码生成器

### AwesomeQRCode written for Android, 支持 Android 的 AwesomeQRCode

Redirect to [AwesomeQRCode](https://github.com/SumiMakito/AwesomeQRCode)

### Vue 2.x Component for Awesome-qr.js

Take a look at [Vue-qr by Binaryify](https://github.com/Binaryify/vue-qr)

### Live demo, 演示网页

Take a look at the [live demo](https://www.bitcat.cc/webapp/awesome-qr/index.html).

### Examples, 样例

> Try to scan these QR codes below with your smart phone.

Example 1|Example 2|Example 3
------------ | ------------- | -------------
<img src="art/awesome-qr-1.png" width="400"> | <img src="art/awesome-qr-2.png" width="400"> | <img src="art/awesome-qr-3.png" width="400">

### Quick start, 快速上手

```java
new AwesomeQRCode(
    {
        text: "Makito loves Kafuu Chino.",  // Contents to encode. 欲编码的内容
        width: 800,                         // Width, should equal to height. 宽度, 宽高应当一致
        height: 800,                        // Height, should equal to width. 高度, 宽高应当一致
        colorDark: "#000000",               // Color of blocks. Will be OVERRIDE by autoColor. 实点的颜色
        colorLight: "#FFFFFF",              // Color of empty space. Will be OVERRIDE by autoColor. 空白点的颜色
        correctLevel: AwesomeQRCode.CorrectLevel.H, 
        backgroundImage: backgroundImg,     // The background image to embed in the QR code. If undefined, no background image will be embedded. 欲嵌入的背景图
        autoColor: true                     // If true, colorDark will be set to the dominant color of backgroundImage. Default is true. 若为 true, 则将从背景图取主要颜色作为实点颜色
    }, 
    function(dataUrl) {
        $("#qrcode").attr("src", dataUrl);
    }
);
```

### Would you like to buy me a cup of cappuccino? 要请我喝一杯卡布奇诺吗？
PayPal | Alipay
----|----
[PayPal](https://www.paypal.me/makito) | [Alipay](https://qr.alipay.com/a6x02021re1jk4ftcymlw79)


### Copyright &amp; License, 版权信息与授权协议

Copyright &copy; 2017 Sumi Makito

Licensed under Apache License 2.0 License.

```
Copyright 2017 Sumi Makito

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
