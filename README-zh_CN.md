# Awesome-qr.js 

[![npm version](https://badge.fury.io/js/awesome-qr.svg)](https://badge.fury.io/js/awesome-qr)
[![license](https://img.shields.io/github/license/SumiMakito/Awesome-qr.js.svg)](https://www.apache.org/licenses/LICENSE-2.0)

一个优雅的<del>(不起眼的)</del> QR 二维码生成器

[Click to read the English documentation](README.md)

### 在线演示

来访问 [最新的演示页面](https://www.bitcat.cc/webapp/awesome-qr/index.html) 吧！

你也可以在手机浏览器的地址栏输入 `bitcat.cc/awesome` 来快速访问演示页面。

### 兼容性

Awesome-qr.js 与下列浏览器相兼容:

- Chrome 4+ (Chrome for Android 53+)
- Firefox 3.6+ (Firefox for Android 49+)
- Opera 9+ (Opera Mobile 10+)
- Safari 4+ (iOS Safari 3.2+)
- Android Browser 3+
- Edge 12+
- IE 9+

### 样例

尝试用手机扫描下面的二维码吧!

#### 简单和普通的样式

样例 1| 样例 2| 样例 3
------------ | ------------- | -------------
<img src="https://raw.githubusercontent.com/SumiMakito/Awesome-qr.js/master/art/awesome-qr-1.png" width="350"> | <img src="https://raw.githubusercontent.com/SumiMakito/Awesome-qr.js/master/art/awesome-qr-2.png" width="350"> | <img src="https://raw.githubusercontent.com/SumiMakito/Awesome-qr.js/master/art/awesome-qr-3.png" width="350">

#### 加了一些 <del>特效</del> 之后

Binarized|With a logo|Custom color|With GIF background
------------ | ------------- | ------------- | -------------
<img src="https://raw.githubusercontent.com/SumiMakito/Awesome-qr.js/master/art/awesome-qr-4.png" width="350"> | <img src="https://raw.githubusercontent.com/SumiMakito/Awesome-qr.js/master/art/awesome-qr-5.png" width="350"> | <img src="https://raw.githubusercontent.com/SumiMakito/Awesome-qr.js/master/art/awesome-qr-6.png" width="350"> | <img src="https://raw.githubusercontent.com/SumiMakito/Awesome-qr.js/master/art/awesome-qr-7.gif" width="350">

### 使用 Awesome-qr.js

> 注意：在 v1.2.0 之后，npmjs 上的 'awesome-qr' 与旧版本完全不同。

#### α. 在 Node.js（服务端）使用

> **重要提醒**：Awesome-qr.js 使用 node-canvas 来绘制生成的二维码图片，因此在执行 `npm install ...` 之前，请务必参考 node-canvas 的 [官方文档](https://github.com/Automattic/node-canvas#installation) 来确保它在你的服务器上可以正常使用。

```
npm install awesome-qr --save
```

> 在 1.2.0 版本之前，Awesome-qr.js 并不是为使用 Node.js 的服务器而设计的，因此请**不要**使用 npm 在服务器上安装低于 1.2.0 的版本，否则将会发生奇怪的事情。

```javascript
let AwesomeQR = require('awesome-qr');

new AwesomeQR().create({
	text: 'Makito loves Kafuu Chino.',
	size: 500,
	callback: (data) => {
	    // 二进制 PNG 数据
	}
});
```

#### β. 在浏览器中使用

> 注意：这里我们**不需要**使用 npmjs，**只需要** require.js 即可。

将 `dist/` 下的 Javascript 文件复制到一个合适的地方，比如 `js/`。

你网站的文件结构看起来应该像这样：

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

引入 require.js：

```html
<script type="text/javascript" src="js/require.js"></script>
```

然后使用 require 载入 awesome-qr.js：

```javascript
// 这一步是为了指定 awesome-qr.js、gif.js 和 gif.worker.js 的目录
// 像上面举例的那种情况，这个目录就应该设置为「js」。
// 请不要更改这个变量名称。
var __awesome_qr_base_path = "js"; 

// require awesome-qr.js
require([__awesome_qr_base_path + '/awesome-qr'], function (AwesomeQR) {
	AwesomeQR.create({
		text: 'Makito loves Kafuu Chino.',
		size: 800,
		margin: 20,
		bindElement: 'qrcode'
	});
});
```
### 更多使用范例

#### 1. 设置背景图片

##### α. 在 Node.js（服务端）使用

```javascript
let request = require('request');
let AwesomeQR = require('awesome-qr');
const {Image} = require('canvas');

let options = {
    url: "https://avatars3.githubusercontent.com/u/5277268?s=460&v=4",
    method: 'GET',
    encoding: null
    // ^ 强制得到 buffer 类型的 body，
    //   而不是 string 类型。
};

request.get(options, (error, response, body) => {
	if (!error && response.statusCode === 200) {
		// 载入背景图片
		let backgroundImage = new Image;
		backgroundImage.src = body;
		
		new AwesomeQR().create({
			text: 'Makito loves Kafuu Chino.',
			size: 500,
			backgroundImage: backgroundImage,
			autoColor: true,
			callback: (data) => {
				if (data === undefined) {
		    		console.log('生成二维码失败');
				} else {
					// 得到 PNG 的二进制数据
				}
			}
		});
	} else {
		console.log('无法取得背景图片');
	}
});
```

> 注意：在 Node.js 下，目前**只支持 PNG 格式** 的背景图片。其他格式的图片将会导致如 `Error: Image given has not completed loading` 的错误。

##### β. 在浏览器中使用

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

> 图像为异步方式载入，因此请留意设置回调函数来取得载入完成的图像数据。参见 [#8](https://github.com/SumiMakito/Awesome-qr.js/issues/8)。


#### 2. 设置居中的 Logo

##### α. 在 Node.js（服务端）使用

暂不支持

##### β. 在浏览器中使用

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

#### 3. 使用 GIF 图像作为背景

##### α. 在 Node.js（服务端）使用

暂不支持

##### β. 在浏览器中使用

请注意 `gifBackground` 这个选项只接收 ArrayBuffer 类型的数据，GIF 图像的数据也将由 ArrayBuffer 代表。因此在生成二维码之前，需要先完成一些转换工作。


```javascript
// 初始化 FileReader
var r = new FileReader();

// 设置 onload 监听
r.onload = function (e) {
	// 取得 ArrayBuffer
    var ab = e.target.result;
    
    AwesomeQR.create({
		text: 'Makito loves Kafuu Chino.',
		size: 800,
		margin: 20,
		gifBackground: ab, 
		// ^ 使用 ArrayBuffer
		bindElement: 'qrcode'
	});
};

// 按 ArrayBuffer 读入
r.readAsArrayBuffer(file);
```

> 若设置了 `gifBackground`，则 `backgroundImage` 将会被忽略。

通常解码编码 GIF 以及生成二维码会花费更多时间，取决于输入文件的大小。

### 选项

#### 基础

Option | 客户端（浏览器） | 服务器端（Node.js）
:------|:-----------------------|:---------------------
text | 必需 | 必需
size | 必需 | 必需
margin | 可选 | 可选
dotScale | 可选 | 可选
maskedDots | 可选 | 不支持
correctLevel | 可选 | 可选
whiteMargin | 可选 | 可选
bindElement | 可选 | 不支持
callback | 可选 | 可选

> 可以使用 `bindElement` 来指定要自动填入二维码图像的元素的 ID（不含前导「#」），支持 `<div>` 或是 `<img>`。

> 选项 `maskedDots ` 为试验性选项。

#### 颜色

Option | 客户端（浏览器） | 服务器端（Node.js）
:------|:-----------------------|:---------------------
colorDark | 可选 | 可选
colorLight | 可选 | 可选
autoColor | 可选 | 可选

> 若设置了 `autoColor`，则 `colorDark` 和 `colorLight` 都将被忽略。

#### 背景图像

Option | 客户端（浏览器） | 服务器端（Node.js）
:------|:-----------------------|:---------------------
backgroundImage | 可选 | 可选
backgroundDimming | 可选 | 可选
gifBackground | 可选 | 不支持

> 若设定了 `gifBackground `，则 `backgroundImage ` 将会被忽略。

#### Logo 图像

Option | 客户端（浏览器） | 服务器端（Node.js）
:------|:-----------------------|:---------------------
logoImage | 可选 | 不支持
logoScale | 可选 | 不支持
logoMargin | 可选 | 不支持
logoCornerRadius | 可选 | 不支持

> Logo 的真实大小将使用 `logoScale*(size-2*margin)` 计算。

#### 后处理

Option | 客户端（浏览器） | 服务器端（Node.js）
:------|:-----------------------|:---------------------
binarize | 可选 | 不支持
binarizeThreshold | 可选 | 不支持

> 选项 `binarizeThreshold ` 的值应该是大于 0 并小于 255 的整数。

#### 附加：默认选项

Awesome-qr.js 将使用以下默认值来填补自定义选项中缺少的部分。

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

### 贊助者們

在一些慷慨的赞助者的赞助下，这个项目得以发展的更好。对于他们的慷慨支持，我愿向他们表达我最真诚的感谢之情。

- [Coxxs](https://coxxs.me/)       

默认情况下，未经赞助者许可的情况下，他们的名字不会出现在这里，因此此处只展示部分赞助者。如果您希望自己的名字出现在这里，请联系我就好啦。
                        
### 支持开发者

如果您喜欢我的作品，欢迎通过捐赠的方式来支持我。

您可以在「支付宝」中搜索 `sumimakito` 或点按下方链接。

- [PayPal](https://www.paypal.me/makito)
- [支付宝](https://qr.alipay.com/a6x02021re1jk4ftcymlw79)

您也可以使用「支付宝」或「微信」扫描下方的二维码来找到我。

<img src="https://raw.githubusercontent.com/SumiMakito/Misc/master/alipay-2.jpg" width="300">

<img src="https://raw.githubusercontent.com/SumiMakito/Misc/master/wechat-2.png" width="300">

### 更新日志

##### Ver. 1.2.0

- 加入 Node.js 支持

##### Ver. 1.1.0

- 加入 GIF 背景支持

##### Ver. 1.0.10

- 修复文字数据过早溢出的问题

##### Ver. 1.0.9

- 修复对齐点在简单二维码上缺失的问题

![](art/bug-fix-1.0.9.png)

##### Ver. 1.0.8

- 修复在点比例为 1.0 时方块间出现白色缝隙的问题

![](art/bug-fix-1.0.8.png)

##### Ver. 1.0.7

- 修复一些小问题

##### Ver. 1.0.6

- 修复坐标系统的问题

##### Ver. 1.0.5

- 加入对使用 [require.js](http://requirejs.org/) 的支持
- 加入对嵌入 Logo 图片的支持
- 加入了之前仅在 Android 的 AwesomeQRCode 上提供的功能

##### Ver. 1.0.4

- 兼容性提升

##### Ver. 1.0.3

- 加入对图像自动填入 DOM 元素的支持

##### Ver. 1.0.2, 1.0.1

- 提交至 npmjs
- 加入对二值化后处理的支持

##### Ver 1.0.0

- 初次发布

### 特别感谢

Awesome QR code 系列项目受 [EFQRCode](https://github.com/EyreFree/EFQRCode) 的启发而诞生，EFQRCode 是一个使用 Swift 写成的艺术二维码生成器。

如果你的 iOS/Mac 项目也需要生成此种二维码，可以尝试使用 EFQRCode。

### AwesomeQRCode：为 Android 设计的二维码生成库

如果你正在开发 Android 应用程式，或许为 Android 设计的 [AwesomeQRCode](https://github.com/SumiMakito/AwesomeQRCode) 可以帮到你。

### 其他版本

- Vue 2.x 组件: [Vue-qr](https://github.com/Binaryify/vue-qr)

### 版权信息与授权协议

版权所有 &copy; 2017 Sumi Makito

在 Apache License 2.0 协议下分发

```
Copyright (c) 2017 Sumi Makito, https://www.keep.moe

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless 必需 by applicable law or agreed to in writing, software
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
