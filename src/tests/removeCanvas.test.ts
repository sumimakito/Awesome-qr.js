// /*  

//     ~~~~~~~~~~~~~~~~~~IMPORTANT~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//     DO NOT DELETE THIS FILE
//     DO NOT PUSH UNCOMMENTED CODE TO GITHUB



//     This file is used for testing individual attributes of the QR Code.

//     The file makes multiple API calls for getting images for Logo and Background , do not push it to github.

//     Suggested : Use this file for testing Qr Codes Locally

// */




// import 'mocha';
// import { CanvasType, DataPattern, EyeBallShape, EyeFrameShape, GradientType, QRCodeFrame, QRErrorCorrectLevel } from '../Enums';
// import { QRCodeBuilder } from '../index';
// import { QRCodeConfig, QRDrawingConfig } from '../Types';
// const sharp = require("sharp")
// // tslint:disable-next-line:no-var-requires
// const fs =  require('fs');

// let size = [512 , 1024 , 2048 , 4096 ]
// let correctLevel = [ QRErrorCorrectLevel.H , QRErrorCorrectLevel.L , QRErrorCorrectLevel.M , QRErrorCorrectLevel.Q ]

// const vCardSampleData = `BEGIN:VCARD
// VERSION:3.0
// N:fgdgdfg;dfdagfsg;
// FN:dfdagfsg fgdgdfg
// ORG:fgfdgdfgdf;
// TITLE:fdgdfg
// TEL;TYPE=work:213213
// TEL;TYPE=mobile:523355
// TEL;TYPE=home:342524
// EMAIL:demo@mobstac.com
// ADR;TYPE=WORK:;;eafe, thgsh;Bangalore;KA;560008;India
// URL:mobstac.com
// REV:2008-04-24T19:52:43Z
// END:VCARD`;

// // const config = {
// //     // text: vCardSampleData,
// //     text: "https://qr.beaconstac.com/",
// //     logoBackground: true,
// //     backgroundColor: "rgba(256,256,256,0)",
// //     canvasType: CanvasType.SVG,
// //     dataPattern: DataPattern.SQUARE,
// //     dotScale: 1,
// //     colorDark: "#000000",
// //     colorLight : '#FF0000',
// //     eyeBallShape: EyeBallShape.SQUARE,
// //     eyeFrameShape: EyeFrameShape.SQUARE,
// //     eyeFrameColor : '#000',
// //     eyeBallColor : '#000',
// //     frameStyle: QRCodeFrame.NONE,
// //     frameText: "THIS IS THIRTY CHARACTERS LONG",
// //     frameColor: "#000",
// //     frameTextColor: "#fff",
// //     gradientType: GradientType.NONE,
// //     logoScale: 0.24,
// //     //backgroundImage :'https://static.beaconstac.com/assets/img/qr-code-logos/gmail.svg',
// //     logoImage : 'https://static.beaconstac.com/assets/img/qr-code-logos/instagram.svg',
// //     size: 1024,
// //     margin: 40,
// //     correctLevel: QRErrorCorrectLevel.Q,
// //     rectangular : false,
// //     // isVcard : true

// // };








// describe('QR Code Logo Test' , () =>{

//     let internalConfig = {
//         text: "https://q.qrcodes.pro/47Kswp",
//         logoBackground: true,
//         backgroundColor: "#ffffff",
//         canvasType: CanvasType.SVG,
//         dataPattern: DataPattern.SQUARE,
//         dotScale: 1,
//         colorDark: "#000000",
//         colorLight : '#FF0000',
//         eyeBallShape: EyeBallShape.SQUARE,
//         eyeFrameShape: EyeFrameShape.SQUARE,
//         eyeFrameColor : '#000000',
//         eyeBallColor : '#000000',
//         frameStyle: QRCodeFrame.NONE,
//         gradientType: GradientType.NONE,
//         logoScale: 0.24,
//         logoImage : 'https://static.beaconstac.com/assets/img/qr-code-logos/instagram.svg',
//         size: 512,
//         viewportSize : 512,
//         margin: 40,
//         correctLevel: QRErrorCorrectLevel.Q,
//         rectangular : false,
//     }


//     let logoBackground = [ true , false];
//     let logos : any  =  {
//         square_svg : 'https://static.beaconstac.com/assets/img/qr-code-logos/instagram.svg',
//         vertical_svg : 'https://s3.amazonaws.com/beaconstac-content-qa/949/6cb065a4f16f468991274f7d7444a22a',
//         horizontal_svg : 'https://vecta.io/blog/5-most-common-problems-faced-by-svg-users/5-most-common-problems-faced-by-svg-users.6626f8f7d9.svg',
//         square_jpeg : 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Square-logo-black.jpeg/1024px-Square-logo-black.jpeg',
//         horizontal_jpeg : 'https://upload.wikimedia.org/wikipedia/commons/0/00/Spotify_logo_horizontal_white.jpg',
//         vertical_jpeg : 'https://previews.123rf.com/images/rglinsky/rglinsky1201/rglinsky120100188/12336990-vertical-oriented-image-of-famous-eiffel-tower-in-paris-france-.jpg'
//     }

//     logoBackground.forEach( (logoBackgroundValue) => {

//         size.forEach(qrSize =>{

//             correctLevel.forEach(correctionLevel => {

//                 Object.keys(logos).forEach(  logoUrl => {

//                     let fileName = 'logoBg_' + logoBackgroundValue + '_' + qrSize + '_' + logoUrl + '_' + correctionLevel
//                     it('Logo test ' + fileName , done =>{
    
//                         let newObject = Object.create(internalConfig);
//                         newObject = internalConfig;
//                         newObject.logoBackground = logoBackgroundValue;
//                         newObject.logoImage = logos[logoUrl];
//                         newObject.size = qrSize;
//                         newObject.correctionLevel = correctionLevel ;
    
//                         const qrCodeGenerator = new QRCodeBuilder(newObject);
//                         qrCodeGenerator.build(CanvasType.SVG).then(async qrCode => {
                            
//                             await fs.writeFileSync(__dirname + `/removeCanvas/LogoTest/${fileName}.` + CanvasType.SVG.toLowerCase(), qrCode.svg);
                            
//                             await sharp(__dirname + `/removeCanvas/LogoTest/${fileName}.svg`).toFile(__dirname + `/removeCanvas/LogoTest/${fileName}.jpeg` );
            
//                             await sharp(__dirname + `/removeCanvas/LogoTest/${fileName}.svg`).toFile(__dirname + `/removeCanvas/LogoTest/${fileName}.png` );
            
//                             done();
//                         }).catch(err => {
//                             console.error(err);
//                             done();
//                         });
//                     });
//                 })

//             })
//         })
//     });
// });














// describe('QR Code Eye Test' , () =>{
//     let internalConfig = {
//         text: "https://q.qrcodes.pro/47Kswp",
//         logoBackground: true,
//         backgroundColor: "#ffffff",
//         canvasType: CanvasType.SVG,
//         dataPattern: DataPattern.SQUARE,
//         dotScale: 1,
//         colorDark: "#000000",
//         colorLight : '#FF0000',
//         eyeBallShape: EyeBallShape.SQUARE,
//         eyeFrameShape: EyeFrameShape.SQUARE,
//         eyeFrameColor : '#000000',
//         eyeBallColor : '#000000',
//         frameStyle: QRCodeFrame.NONE,
//         gradientType: GradientType.NONE,
//         logoScale: 0.24,
//         size: 512,
//         viewportSize : 512,
//         margin: 40,
//         correctLevel: QRErrorCorrectLevel.Q,
//     }

//     const eyeBallShape = [ EyeBallShape.CIRCLE , EyeBallShape.LEFT_DIAMOND , EyeBallShape.LEFT_LEAF , EyeBallShape.RIGHT_DIAMOND , EyeBallShape.RIGHT_LEAF , EyeBallShape.ROUNDED , EyeBallShape.SQUARE ];
//     const eyeFrameShape = [ EyeFrameShape.CIRCLE , EyeFrameShape.LEFT_LEAF , EyeFrameShape.RIGHT_LEAF , EyeFrameShape.ROUNDED , EyeFrameShape.SQUARE ]
//     const colors = ['#000000' , '#FF0000' , '#00FF00' , '#0000FF']

//     size.forEach( qrSize =>{

//         correctLevel.forEach( correctionLevel => {

//             eyeBallShape.forEach( shape =>{

//                 eyeFrameShape.forEach( frame =>{
        
//                     let maximum = colors.length -1 ;
//                     let minimum = 0;
//                     var color1index = Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
//                     var color2index = Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
        
//                     let fileName = 'eyeShape_' + shape + '_frameShape_' + frame + '_' + colors[color1index] + '_' +  colors[color2index] + '_' + qrSize + '_' + correctionLevel ;
//                     it('Eyes Test ' + fileName , done =>{
        
//                         let newObject = Object.create(internalConfig);
//                         newObject = internalConfig;
//                         newObject.eyeBallShape = shape;
//                         newObject.eyeFrameShape = frame;
//                         newObject.eyeBallColor = colors[color1index];
//                         newObject.eyeFrameColor =  colors[color2index];
//                         newObject.size = qrSize ;
//                         newObject.correctionLevel = correctionLevel ;
        
//                         const qrCodeGenerator = new QRCodeBuilder(newObject);
//                         qrCodeGenerator.build(CanvasType.SVG).then(async qrCode => {
                            
//                             await fs.writeFileSync(__dirname + `/removeCanvas/eyeTest/${fileName}.` + CanvasType.SVG.toLowerCase(), qrCode.svg);
                            
//                             await sharp(__dirname + `/removeCanvas/eyeTest/${fileName}.svg`).toFile(__dirname + `/removeCanvas/eyeTest/${fileName}.jpeg` );
            
//                             await sharp(__dirname + `/removeCanvas/eyeTest/${fileName}.svg`).toFile(__dirname + `/removeCanvas/eyeTest/${fileName}.png` );
            
//                             done();
//                         }).catch(err => {
//                             console.error(err);
//                             done();
//                         });
//                     });
//                 })
//             })

//         })
//     })
// });












// describe('QR Code Data Pattern test' , () =>{

//     let internalConfig = {
//         text: "https://q.qrcodes.pro/47Kswp",
//         logoBackground: true,
//         backgroundColor: "#ffffff",
//         canvasType: CanvasType.SVG,
//         dataPattern: DataPattern.SQUARE,
//         dotScale: 1,
//         colorDark: "#000000",
//         colorLight : '#FF0000',
//         eyeBallShape: EyeBallShape.SQUARE,
//         eyeFrameShape: EyeFrameShape.SQUARE,
//         eyeFrameColor : '#000000',
//         eyeBallColor : '#000000',
//         frameStyle: QRCodeFrame.NONE,
//         gradientType: GradientType.NONE,
//         logoScale: 0.24,
//         size: 512,
//         viewportSize : 512,
//         margin: 40,
//         correctLevel: QRErrorCorrectLevel.Q,
//     }

//     let dataPattern = [ DataPattern.CIRCLE , DataPattern.KITE , DataPattern.LEFT_DIAMOND , DataPattern.RIGHT_DIAMOND , DataPattern.SQUARE ];
//     let gradientType = [ GradientType.HORIZONTAL , GradientType.RADIAL , GradientType.NONE , GradientType.VERTICAL];
//     const colors = ['#000000' , '#FF0000' , '#00FF00' , '#0000FF']

//     size.forEach( qrSize => {

//         correctLevel.forEach( correctionLevel => {

//             dataPattern.forEach( pattern =>{

//                 gradientType.forEach( gradient =>{
        
//                     let maximum = colors.length -1 ;
//                     let minimum = 0;
//                     var color1index = Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
//                     var color2index = Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
        
//                     let fileName = 'pattern_' + pattern + '_gradient_' + gradient + '_' + colors[color1index] + '_' +  colors[color2index] + '_' + qrSize + '_' + correctionLevel ;
        
//                     it('Data Pattern test ' + fileName , done =>{
        
//                         let newObject = Object.create(internalConfig);
//                         newObject = internalConfig;
//                         newObject.dataPattern = pattern;
//                         newObject.gradientType = gradient;
//                         newObject.colorDark = colors[color1index];
//                         newObject.colorLight = colors[color2index];
//                         newObject.size = qrSize;
//                         newObject.correctionLevel = correctionLevel ;
        
//                         const qrCodeGenerator = new QRCodeBuilder(newObject);
//                         qrCodeGenerator.build(CanvasType.SVG).then(async qrCode => {
                            
//                             await fs.writeFileSync(__dirname + `/removeCanvas/dataPatternTest/${fileName}.` + CanvasType.SVG.toLowerCase(), qrCode.svg);
                            
//                             await sharp(__dirname + `/removeCanvas/dataPatternTest/${fileName}.svg`).toFile(__dirname + `/removeCanvas/dataPatternTest/${fileName}.jpeg` );
            
//                             await sharp(__dirname + `/removeCanvas/dataPatternTest/${fileName}.svg`).toFile(__dirname + `/removeCanvas/dataPatternTest/${fileName}.png` );
            
//                             done();
//                         }).catch(err => {
//                             console.error(err);
//                             done();
//                         });
//                     });
//                 })
//             })

//         })
//     })

// });













// describe( 'QR Code Background test' , () =>{
  
//     let internalConfig = {
//         text: "https://q.qrcodes.pro/47Kswp",
//         logoBackground: true,
//         backgroundColor: "#ffffff",
//         canvasType: CanvasType.SVG,
//         dataPattern: DataPattern.SQUARE,
//         dotScale: 1,
//         colorDark: "#000000",
//         colorLight : '#FF0000',
//         eyeBallShape: EyeBallShape.SQUARE,
//         eyeFrameShape: EyeFrameShape.SQUARE,
//         eyeFrameColor : '#000000',
//         eyeBallColor : '#000000',
//         frameStyle: QRCodeFrame.NONE,
//         gradientType: GradientType.NONE,
//         logoScale: 0.24,
//         size: 512,
//         viewportSize : 512,
//         margin: 40,
//         correctLevel: QRErrorCorrectLevel.Q,
//     }

//     let backgroundImages : any  =  {
//         square_svg : 'https://static.beaconstac.com/assets/img/qr-code-logos/instagram.svg',
//         vertical_svg : 'https://s3.amazonaws.com/beaconstac-content-qa/949/6cb065a4f16f468991274f7d7444a22a',
//         horizontal_svg : 'https://vecta.io/blog/5-most-common-problems-faced-by-svg-users/5-most-common-problems-faced-by-svg-users.6626f8f7d9.svg',
//         square_jpeg : 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Square-logo-black.jpeg/1024px-Square-logo-black.jpeg',
//         horizontal_jpeg : 'https://upload.wikimedia.org/wikipedia/commons/0/00/Spotify_logo_horizontal_white.jpg',
//         vertical_jpeg : 'https://previews.123rf.com/images/rglinsky/rglinsky1201/rglinsky120100188/12336990-vertical-oriented-image-of-famous-eiffel-tower-in-paris-france-.jpg'
//     }

//     let backgroundColors = ['#FFFFFF' , '#FF0000' , '#00FF00' , '#0000FF' , 'rgba(256,256,256,0)']


//     size.forEach( qrSize => {

//         correctLevel.forEach(correctionLevel => {

//             Object.keys(backgroundImages).forEach(  image => {

//                 let fileName = 'Bg_image_' + image  + '_' + qrSize;
//                 it('Background Image test ' + fileName , done =>{
        
//                     let newObject = Object.create(internalConfig);
//                     newObject = internalConfig;
//                     newObject.backgroundImage = backgroundImages[image];
//                     newObject.size = qrSize;
//                     newObject.correctionLevel = correctionLevel ;
        
//                     const qrCodeGenerator = new QRCodeBuilder(newObject);
//                     qrCodeGenerator.build(CanvasType.SVG).then(async qrCode => {
                        
//                         await fs.writeFileSync(__dirname + `/removeCanvas/backgroundTest/image/${fileName}.` + CanvasType.SVG.toLowerCase(), qrCode.svg);
                        
//                         await sharp(__dirname + `/removeCanvas/backgroundTest/image/${fileName}.svg`).toFile(__dirname + `/removeCanvas/backgroundTest/image/${fileName}.jpeg` );
        
//                         await sharp(__dirname + `/removeCanvas/backgroundTest/image/${fileName}.svg`).toFile(__dirname + `/removeCanvas/backgroundTest/image/${fileName}.png` );
        
//                         done();
//                     }).catch(err => {
//                         console.error(err);
//                         done();
//                     });
//                 });
//             })

//         });
//     })
    

//     size.forEach( qrSize => {

//         correctLevel.forEach(correctionLevel => {

//             backgroundColors.forEach( color => {
//                 let fileName = 'Bg_color_' + color + '_' + qrSize;
//                 it('Background Color test ' + fileName , done =>{
        
//                     let newObject = Object.create(internalConfig);
//                     newObject = internalConfig;
//                     newObject.backgroundColor = color;
//                     delete newObject.qrSize ;
//                     newObject.size = qrSize ;
//                     delete newObject.backgroundImage
//                     newObject.correctionLevel = correctionLevel ;
    
        
//                     const qrCodeGenerator = new QRCodeBuilder(newObject);
//                     qrCodeGenerator.build(CanvasType.SVG).then(async qrCode => {
                        
//                         await fs.writeFileSync(__dirname + `/removeCanvas/backgroundTest/color/${fileName}.` + CanvasType.SVG.toLowerCase(), qrCode.svg);
                        
//                         if(color != 'rgba(256,256,256,0)'){
//                             await sharp(__dirname + `/removeCanvas/backgroundTest/color/${fileName}.svg`).toFile(__dirname + `/removeCanvas/backgroundTest/color/${fileName}.jpeg` );
//                         }
        
//                         await sharp(__dirname + `/removeCanvas/backgroundTest/color/${fileName}.svg`).toFile(__dirname + `/removeCanvas/backgroundTest/color/${fileName}.png` );
        
//                         done();
//                     }).catch(err => {
//                         console.error(err);
//                         done();
//                     });
//                 });
//             })

//         })
//     })


// });








// describe('QR Code Frame Test' , () =>{
//     let internalConfig = {
//         text: vCardSampleData,
//         isVCard : true,
//         // text : 'www.beaconstac.com/frametestcheck',
//         logoBackground: true,
//         backgroundColor: "#ffffff",
//         canvasType: CanvasType.SVG,
//         dataPattern: DataPattern.SQUARE,
//         dotScale: 1,
//         colorDark: "#000000",
//         colorLight : '#FF0000',
//         eyeBallShape: EyeBallShape.SQUARE,
//         eyeFrameShape: EyeFrameShape.SQUARE,
//         eyeFrameColor : '#000000',
//         eyeBallColor : '#000000',
//         frameStyle: QRCodeFrame.NONE,
//         gradientType: GradientType.NONE,
//         logoScale: 0.24,
//         size: 1024,
//         viewportSize : 1024,
//         margin: 40,
//         correctLevel: QRErrorCorrectLevel.Q,
//         frameTextColor: "#999999",
//         rectangular : false,
//         logoHeight : 300,
//         logoWidth : 300, 
//         logoImage : 'https://s3.amazonaws.com/beaconstac-content-qa/949/d51b8863835644d28fa1cce77f8d14e4',
//         backgroundImage : 'https://previews.123rf.com/images/rglinsky/rglinsky1201/rglinsky120100188/12336990-vertical-oriented-image-of-famous-eiffel-tower-in-paris-france-.jpg'
//     }

//     let frames = [ QRCodeFrame.BALLOON_BOTTOM , QRCodeFrame.BALLOON_TOP , QRCodeFrame.BANNER_BOTTOM , QRCodeFrame.BANNER_TOP , QRCodeFrame.BOX_BOTTOM , QRCodeFrame.BOX_TOP , QRCodeFrame.CIRCULAR , QRCodeFrame.FOCUS , QRCodeFrame.TEXT_ONLY , QRCodeFrame.NONE]
//     const colors = ['#000000' , '#FF0000' , '#00FF00' , '#0000FF']
//     let qrSize = 1024
//     let frameTexts = ['12345' , '123456789012345' , '1234567890123456789012345']
//     // size.forEach( qrSize => {
//     frameTexts.forEach( frameText =>{
//         frames.forEach( frame => {

//             let fileName = 'Frame_' + frame + '_' + qrSize + '_' + frameText;
//             it('Frame test ' + fileName , done =>{
    
//                 let newObject = Object.create(internalConfig);
//                 newObject = internalConfig;
//                 newObject.frameStyle = frame;
//                 newObject.frameText = frameText;
//                 newObject.size = qrSize ;
    
//                 let maximum = colors.length -1 ;
//                 let minimum = 0;
//                 var frameColor = Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
    
//                 newObject.frameTextColor = '#999999'
//                 newObject.frameColor = colors[frameColor];
    
    
//                 const qrCodeGenerator = new QRCodeBuilder(newObject);
//                 qrCodeGenerator.build(CanvasType.SVG).then(async qrCode => {
                    
//                     await fs.writeFileSync(__dirname + `/removeCanvas/frameTest/${fileName}.` + CanvasType.SVG.toLowerCase(), qrCode.svg);
                    
//                     await sharp(__dirname + `/removeCanvas/frameTest/${fileName}.svg`).toFile(__dirname + `/removeCanvas/frameTest/${fileName}.jpeg` );
    
//                     await sharp(__dirname + `/removeCanvas/frameTest/${fileName}.svg`).toFile(__dirname + `/removeCanvas/frameTest/${fileName}.png` );
    
//                     done();
//                 }).catch(err => {
//                     console.error(err);
//                     done();
//                 });
//             });
//         })
//     })
//     // })
// })




