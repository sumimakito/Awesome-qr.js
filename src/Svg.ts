/* tslint:disable:no-var-requires */
// @ts-ignore
import { Gradient, SVG , registerWindow} from '@svgdotjs/svg.js';
import { CanvasUtil, maxLogoScale } from './Common';
import { DataPattern, EyeBallShape, EyeFrameShape, GradientType, QRCodeFrame } from './Enums';
import { QRCodeConfig, QRDrawingConfig } from './Types';
import { isNode, isSvgFile, getFrameTextSize } from './Util';
const fetch = require('node-fetch');
const sharp = require("sharp")
const probe = require('probe-image-size');



export class SVGDrawing {
    private static generateDrawingConfig(config: QRCodeConfig, qrModuleCount: number): QRDrawingConfig {
        const dotScale = config.dotScale;
        if (dotScale <= 0 || dotScale > 1) {
            throw new Error('Scale should be in range (0, 1].');
        }

        const rawSize = config.size;
        let rawMargin = config.margin;

        if (rawMargin < 0 || rawMargin * 2 >= rawSize) {
            rawMargin = 0;
        }
        const margin = Math.ceil(rawMargin);

        const rawViewportSize = rawSize - 2 * rawMargin;
        const nSize = Math.ceil(rawViewportSize / qrModuleCount);
        const viewportSize = nSize * qrModuleCount;
        const size = viewportSize + 2 * margin;
        let qrmargin  = config.margin;
        if (config.frameStyle === QRCodeFrame.CIRCULAR) {
            qrmargin = 0;
        }
        const drawingConfig: Partial<QRDrawingConfig> = {
            size,
            nSize,
            rawSize: config.size,
            viewportSize,
            margin: qrmargin,
            dotScale,
            moduleSize: nSize,
        };

        // @ts-ignore
        return Object.assign(config, drawingConfig);
    }

    public config: QRDrawingConfig;
    public isPainted: boolean;
    public canvas: any;
    public context: any;

    // public maskCanvas?: Canvas;
    public maskCanvas: any;
    // public maskContext?: CanvasRenderingContext2D;

    private patternPosition: number[];
    private moduleCount: number;
    private isDark: any;
    // noinspection JSMismatchedCollectionQueryUpdate
    private modules: Array<Array<boolean | null>>;
    private shiftX = 0;
    private shiftY = 0;
    private widthSVG = 0;
    private widthView = 0;
    public calculatedLogoWidth = 0;
    public calculatedLogoHeight = 0;
    public calculatedLogoAreaWidth = 0;
    public calculatedLogoAreaHeight = 0;
    public logoAreaCordinateX = 0;
    public logoAreaCordinateY = 0;
    public logoCordinateX = 0;
    public logoCordinateY = 0
    public TwoDArray: any;
    public isSmoothPattern: boolean = false;


    constructor(moduleCount: number, patternPosition: number[], config: QRCodeConfig, isDark: any, modules: Array<Array<boolean | null>>) {
        this.moduleCount = moduleCount;
        this.patternPosition = patternPosition;
        this.isDark = isDark;
        this.modules = modules;
        this.config = SVGDrawing.generateDrawingConfig(config, moduleCount);
        this.isPainted = false;

        const { createSVGWindow } = eval('require')('svgdom');
        const QRsvgWindow = createSVGWindow();
        const svgDocument = QRsvgWindow.document;
        registerWindow(QRsvgWindow, svgDocument);
        // @ts-ignore
        this.QrSvg = SVG(svgDocument.documentElement).size(config.size, config.size);
        

        if (isNode) {
            const { createSVGWindow } = eval('require')('svgdom');
            const svgWindow = createSVGWindow();
            const svgDocument = svgWindow.document;

            registerWindow(svgWindow, svgDocument);
            // @ts-ignore
            this.canvas = SVG(svgDocument.documentElement).size(config.size, config.size);
        } else {
            this.canvas = SVG().size(config.size, config.size);
        }
    }

    // Root function for  creating SVGs
    public async drawSVG(): Promise<any> {
        const frameStyle = this.config.frameStyle;
        let mainCanvas: object;
        let canvasHeight: number;
        let canvasWidth: number;

        if (isNode) {
            const { createSVGWindow } = eval('require')('svgdom');
            const svgWindow = createSVGWindow();
            const svgDocument = svgWindow.document;
        }

        if (frameStyle && frameStyle !== QRCodeFrame.NONE) {
            const moduleSize = this.config.moduleSize;
            const rawSize = this.config.size;
            const size = rawSize + moduleSize * 2;
            canvasHeight = 1.27 * size;
            canvasWidth = size + moduleSize;
            if (frameStyle === QRCodeFrame.BANNER_TOP || frameStyle === QRCodeFrame.BANNER_BOTTOM) {
                canvasHeight = 1.25 * size;
            }
            if (frameStyle === QRCodeFrame.BOX_TOP || frameStyle === QRCodeFrame.BOX_BOTTOM) {
                canvasHeight = 1.25 * size;
            }

            if (frameStyle === QRCodeFrame.CIRCULAR) {
                if(this.config.size >= 1024) {
                    this.widthSVG = 12;
                    this.widthView = 15;
                } else {
                    this.widthSVG = 38;
                    this.widthView = 38;
                }
                // @ts-ignore
                mainCanvas = isNode ? SVG(svgDocument.documentElement).size(canvasWidth+this.widthSVG, canvasHeight) : SVG().size(canvasWidth+this.widthSVG, canvasHeight);
                // @ts-ignore
                mainCanvas.viewbox(0, 0, canvasWidth+this.widthView, canvasHeight).fill(this.config.backgroundColor ? this.config.backgroundColor : '#ffffff');
            } else {
                // @ts-ignore
                mainCanvas = isNode ? SVG(svgDocument.documentElement).size(canvasWidth, canvasHeight) : SVG().size(canvasWidth+this.widthSVG, canvasHeight);
                // @ts-ignore
                mainCanvas.viewbox(0, 0, canvasWidth , canvasHeight ).fill(this.config.backgroundColor ? this.config.backgroundColor : '#ffffff');
                
            }

            // Change the value by which QR Code should be shifted for different frames
            switch (frameStyle) {
                case QRCodeFrame.BALLOON_BOTTOM:
                    this.shiftX = 1.5 * this.config.moduleSize;
                    this.shiftY = 1.5 * this.config.moduleSize;
                    break;
                case QRCodeFrame.BALLOON_TOP:
                    this.shiftX = 1.5 * this.config.moduleSize;
                    this.shiftY = size / 5 + size / 12;
                    if (this.config.isVCard) {
                        this.shiftY = 10 * moduleSize + size / 5;
                    }
                    break;
                case QRCodeFrame.BOX_BOTTOM:
                    this.shiftX = 1.5 * this.config.moduleSize;
                    this.shiftY = 1.5 * this.config.moduleSize;
                    break;
                case QRCodeFrame.BANNER_TOP:
                    this.shiftX = 1.5 * this.config.moduleSize;
                    this.shiftY = 1.5 * this.config.moduleSize + size / 5 - 1;
                    break;
                case QRCodeFrame.BANNER_BOTTOM:
                    this.shiftX = 1.5 * this.config.moduleSize;
                    this.shiftY = 1.5 * this.config.moduleSize;
                    break;
                case QRCodeFrame.BOX_TOP:
                    this.shiftX = 1.5 * this.config.moduleSize;
                    this.shiftY = 2.5 * this.config.moduleSize + size / 5;
                    break;
                case QRCodeFrame.TEXT_ONLY:
                    this.shiftX = 1.5 * this.config.moduleSize;
                    this.shiftY = 1.5 * this.config.moduleSize;
                    break;
                case QRCodeFrame.FOCUS:
                    this.shiftX = 1.5 *  this.config.moduleSize;
                    this.shiftY = 1.5 * this.config.moduleSize; 
                    break;
                default:
                    break;
            }
        } else {
            canvasHeight = this.config.size;
            canvasWidth = this.config.size;

            // @ts-ignore
            mainCanvas = isNode ? SVG(svgDocument.documentElement).size(canvasWidth, canvasHeight) : SVG().size(canvasWidth+this.widthSVG, canvasHeight);

            // @ts-ignore
            mainCanvas.viewbox(0, 0, canvasWidth, canvasHeight).fill(this.config.backgroundColor ? this.config.backgroundColor : '#ffffff');
        }

        const gradient: string = this.config.colorDark;
        
        if(this.config.frameStyle === QRCodeFrame.CIRCULAR ){
            this.config.size = this.config.viewportSize;
        }

        if(this.config.logoImage){
            await this.setLogoDimensions() ;
            this.calculateLogoDimensions() ;
        }

        if( this.config.dataPattern === DataPattern.SMOOTH_ROUND || this.config.dataPattern === DataPattern.SMOOTH_SHARP ) {
            const xyOffset = (1 - this.config.dotScale) * 0.5;
            this.create2DArrayOfDots(this.moduleCount,xyOffset)
            this.isSmoothPattern = true;
        } 

        if( this.config.dataPattern === DataPattern.THIN_SQUARE ){
            this.config.dotScale = 0.75
        }

        /* The Svg is drawn in layers 
            - drawFrame() : used to draw frame (if any)
            - drawAlignPatterns() : used to for plotting actual data dots of Qr Code
            - drawAlignProtectoers() : Used for drawing alignment eyes 
            - drawPositionPatterns() : this function creates eyes and time-line
            - drawLogoImage() : used for adding  logo , this handles different cases for different file types and size of logo
            - addDesign() : This is explicitly for circular frames , above functions may not run for circular frames.
        */

        return this.drawFrame(mainCanvas, this.config.frameStyle, this.config.frameColor, this.config.frameText)
            .then(() => {
                return this.addBackground(mainCanvas, this.config.size, this.config.backgroundImage, this.config.backgroundColor);
            })
            .then(() => {
                return this.drawAlignPatterns(mainCanvas, gradient); //TODO Check Plotting of dots for Qr Codes with frame
            })
            .then(() => {
                return this.drawAlignProtectors(mainCanvas);
            })
            .then(() => {
                return this.drawPositionPatterns(mainCanvas, gradient); //TODO Check Plotting of dots for Qr Codes with frame
            })
            .then(() => {
                return this.fillMargin(mainCanvas);
            })
            .then(() => {
                return this.drawLogoImage(mainCanvas);
            })
            .then(()=>{
                // @ts-ignore
                return this.addDesign(mainCanvas,gradient);
            })
            .then((canvas: object) => {
                // @ts-ignore
                return canvas.svg();
            });
    }

    private checkCircle(x: number, y: number, r: number , cx: number) {
        if((x-cx)*(x-cx) + (y-cx) * (y-cx) <= r*r) {
            return true;
        }
        return false;
    }
    

    private middleSquare(seed: number) {
        let result = (seed * seed).toString();
        const str = this.config.text;
        const len = str.length;
        if(result === 'NaN') {
            result  = (str.charCodeAt(0) + str.charCodeAt(len-1)).toString();;
        }
        while(result.length<4){
            result  = '0' + result;
        }
        result = result.slice(1, 3);
        let randomNumber = parseInt(result, 10);
        if(randomNumber ===  0){
            randomNumber = str.charCodeAt(0) + str.charCodeAt(len-1);
        }
        return randomNumber;
    }

    private async addDesignHelper(finalCanvas: object, canvas: object, gradient: string) {
        const size = this.config.size;
        const pos = Math.sqrt(2) * size / 2 + this.config.moduleSize;
        const radius = size / Math.sqrt(2) + this.config.moduleSize / 2;

        const dataPattern = this.config.dataPattern ? this.config.dataPattern : DataPattern.SQUARE;
        const moduleSize = this.config.dotScale * this.config.moduleSize;
        const increment  = this.config.nSize + ( 1 - this.config.dotScale ) * 0.5 * this.config.nSize;
        const shift = ( Math.sqrt(2) * size + 2 * this.config.moduleSize - size) / 2 ;
        const limit  = Math.sqrt(2) * size + 2 * this.config.moduleSize;
        const str = this.config.text;
        const len = str.length;
        let num = str.charCodeAt(0) + str.charCodeAt(len-1);
        const randomArray: any = [];
        const margin = 0.3 * moduleSize;


        //Left Side Dots 
        let leftSideDots : Array<Array<boolean | object>> = [];
        for(let r = shift - moduleSize - margin, row = 0; r >=0 ; r -= increment, row++) {
            leftSideDots[row] = []
            for(let c = 0 , col = 0; c < limit  ; c += increment, col++) {
                const i  = r ;
                const j  = c ;
                num = this.middleSquare(num*i+j);
                if((num%2) === 0 && this.checkCircle(i,j,radius,pos) && this.checkCircle(i+moduleSize , j+moduleSize, radius, pos)) {
                    randomArray.push({"i": i,"j": j});
                    leftSideDots[row][col] =  {"i": i,"j": j };
                } else {
                    leftSideDots[row][col] = false ;
                }
            }
            leftSideDots[row].reverse();
        }

        let tempLeftArray : Array<Array<boolean | object>> = [];
        for(let row = 0 ; row < leftSideDots[0].length ; row++ ){
            tempLeftArray[row] = []
            for( let col = 0 ; col < leftSideDots.length ; col++ ){
                tempLeftArray[row][col] = leftSideDots[col][row]
            }
            tempLeftArray[row].reverse();
        }
        tempLeftArray.reverse()
        leftSideDots = tempLeftArray;



        //Right Side Dots
        num = str.charCodeAt(0) + str.charCodeAt(len-1);
        let rightSideDots : Array<Array<boolean | object>> = [];
        for(let r = shift+ size + margin, row = 0; r < limit ; r += increment, row++) {
            rightSideDots[row] = []
            for(let c = 0, col = 0 ; c < limit  ; c += increment, col++ ) {
                const i  = r ;
                const j  = c ;
                num = this.middleSquare(num*i+j);
                if((num%2) === 0 && this.checkCircle(i,j,radius,pos) && this.checkCircle(i+moduleSize , j+moduleSize, radius, pos)) {
                    randomArray.push({"i": i,"j": j});
                    rightSideDots[row][col] = {"i": i,"j": j}
                } else {
                    rightSideDots[row][col] = false
                }
            }
        }
        let tempRightArray : Array<Array<boolean | object>> = [];
        for(let row = 0 ; row < rightSideDots[0].length ; row++ ){
            tempRightArray[row] = []
            for( let col = 0 ; col < rightSideDots.length ; col++ ){
                tempRightArray[row][col] = rightSideDots[col][row]
            }
        }
        rightSideDots = tempRightArray;



        //Down Side Dots
        num = str.charCodeAt(0) + str.charCodeAt(len-1);
        let downSideDots : Array<Array<boolean | object>> = []
        for(let r = 0, row = 0; r < limit ; r += increment, row++ ) {
            downSideDots[row] = []
            for(let c = shift + size + margin, col = 0 ; c < limit  ; c += increment, col++) {
                const i  = r ;
                const j  = c ;
                num = this.middleSquare(num*i+j);
                if((num%2) === 0 && this.checkCircle(i,j,radius,pos) && this.checkCircle(i+moduleSize , j+moduleSize, radius, pos)) {
                    randomArray.push({"i": i,"j": j});
                    downSideDots[row][col] = {"i": i,"j": j}
                } else {
                    downSideDots[row][col] = false;
                }
            }
        }
        let tempDownArray : Array<Array<boolean | object>> = [];
        for(let row = 0 ; row < downSideDots[0].length ; row++ ){
            tempDownArray[row] = []
            for( let col = 0 ; col < downSideDots.length ; col++ ){
                tempDownArray[row][col] = downSideDots[col][row]
            }
        }
        downSideDots = tempDownArray;



        //Up side Dots
        let upSideDots : Array<Array<boolean | object>> = []
        num = str.charCodeAt(0) + str.charCodeAt(len-1);
        for(let r = 0, row = 0; r < limit ; r += increment, row++) {
            upSideDots[row] = []
            for(let c = shift - moduleSize - margin, col = 0; c >= 0  ; c -= increment, col++) {
                const i  = r;
                const j  = c ;
                num = this.middleSquare(num*i+j);
                if((num%2 === 1) && this.checkCircle(i,j,radius,pos) && this.checkCircle(i+moduleSize , j+moduleSize, radius, pos)) {
                    randomArray.push({"i": i,"j": j});
                    upSideDots[row][col] = {"i": i,"j": j}
                } else {
                    upSideDots[row][col] = false;
                }
            }
            upSideDots[row].reverse()
        }
        let tempUpArray : Array<Array<boolean | object>> = [];
        for(let row = 0 ; row < upSideDots[0].length ; row++ ){
            tempUpArray[row] = []
            for( let col = 0 ; col < upSideDots.length ; col++ ){
                tempUpArray[row][col] = upSideDots[col][row]
            }
        }
        upSideDots = tempUpArray;


        if( this.isSmoothPattern ){
            this.addCircularFrameOuterDots(leftSideDots, finalCanvas);
            this.addCircularFrameOuterDots(rightSideDots, finalCanvas);
            this.addCircularFrameOuterDots(downSideDots, finalCanvas);
            this.addCircularFrameOuterDots(upSideDots, finalCanvas);
            // @ts-ignore
            finalCanvas.add(canvas.move(shift,shift));
            return finalCanvas;
        }

        for(const values of Object.values(randomArray)) {
            // @ts-ignore
            const i  = values["i"];
            // @ts-ignore
            const j  = values["j"];
            let grad = this.getColorFromQrSvg(i , j , true);
            if(this.config.gradientType === GradientType.RADIAL) {
                grad = this.config.colorDark;
            }
            switch (dataPattern) {
                case DataPattern.CIRCLE:
                    // @ts-ignore
                this.drawCircle(i+moduleSize/2, j+moduleSize/2, finalCanvas, grad, moduleSize / 2, moduleSize / 2, false);
                break;
                case DataPattern.KITE:
                    // @ts-ignore
                    this.drawKite(i, j, finalCanvas, grad, moduleSize, moduleSize);
                    break;
                case DataPattern.LEFT_DIAMOND:
                    // @ts-ignore
                    this.drawDiamond(i, j, finalCanvas, grad, moduleSize, moduleSize, false);
                    break;
                case DataPattern.RIGHT_DIAMOND:
                    // @ts-ignore
                    this.drawDiamond(i, j, finalCanvas, grad, moduleSize, moduleSize, true);
                    break;
                case DataPattern.THIN_SQUARE:
                    // @ts-ignore
                    this.drawThinSquare(i, j, finalCanvas, grad, moduleSize, moduleSize);
                    break;
                default:
                    // @ts-ignore
                    this.drawSquare(i, j, finalCanvas, moduleSize, moduleSize, false, grad);
                    break;
            }
        }
        // @ts-ignore
        finalCanvas.add(canvas.move(shift,shift));
        return finalCanvas;
    }

    addCircularFrameOuterDots(randomArray: any, canvas: object) {
        this.TwoDArray = randomArray;
        const dataPattern = this.config.dataPattern ? this.config.dataPattern : DataPattern.SQUARE;
        // Add dots to canvas
        for( let row = 0 ; row < randomArray.length ; row++ ){
            for( let col = 0 ; col < randomArray[0].length ; col++ ){
                if(this.TwoDArray[row][col]){

                    const positionX = this.TwoDArray[row][col].i
                    const positionY = this.TwoDArray[row][col].j

                    let gradient = this.config.colorDark;
                    if( this.config.gradientType !== GradientType.RADIAL )
                        gradient = this.getColorFromQrSvg(positionX, positionY, true)
                        
                    if( dataPattern === DataPattern.SMOOTH_ROUND ){
                        this.drawSmoothRound(positionX, positionY, canvas, gradient, this.config.moduleSize, this.config.moduleSize, row, col)
                    } else {
                        this.drawSmoothSharp(positionX, positionY, canvas, gradient, this.config.moduleSize, this.config.moduleSize, row, col)
                    }   
                }
            }
        }        
    }


    private async addDesign(canvas: object,gradient: string): Promise<object> {
        if (this.config.frameStyle !== QRCodeFrame.CIRCULAR) {
            return canvas;
        }

        const size = this.config.size;;
        const { createSVGWindow } = require('svgdom');
        const svgWindow = createSVGWindow();
        const svgDocument = svgWindow.document;
        const { SVG, registerWindow } = require('@svgdotjs/svg.js');
        const finalCanvas = SVG(svgDocument.documentElement).size(Math.sqrt(2)*size + 2*this.config.moduleSize, Math.sqrt(2)*size + 2*this.config.moduleSize);
        const color = this.config.backgroundColor ? this.config.backgroundColor : 'none' ;
        const width = this.config.moduleSize;
        // @ts-ignore
        let grad : any;
        const col1 = this.config.colorDark;
        const col2 = this.config.colorLight;
        switch (this.config.gradientType) {
            case GradientType.HORIZONTAL:
                // @ts-ignore
                grad = finalCanvas.gradient('linear', function(add) {
                    add.stop(0, col1 )
                    add.stop(1, col2 )
                    });
                    break;
            case GradientType.VERTICAL:
                // @ts-ignore
                grad = finalCanvas.gradient('linear', function(add) {
                    add.stop(0, col1 )
                    add.stop(1, col2 )
                    }).from(0, 0).to(0, 1);
                break;
            case GradientType.LINEAR:
                // @ts-ignore
                grad = finalCanvas.gradient('linear', function(add) {
                    add.stop(0, col1 )
                    add.stop(1, col2 )
                    });
                    break;
            default:
                grad =gradient;
        }
        const pos = Math.sqrt(2)*size/2 + this.config.moduleSize;
        const radius = (size)/Math.sqrt(2) + this.config.moduleSize/2;
        if (this.config.backgroundImage) {
            finalCanvas.circle(size).attr({cx: pos,cy: pos, stroke:grad, 'stroke-width':width}).radius(radius).fill(grad);
            finalCanvas.circle(Math.sqrt(2)*size + 2*this.config.moduleSize - width * 2).attr({cx : pos , cy : pos}).fill('#ffffff')
            return this.addCircularBackgroundImage(finalCanvas, Math.sqrt(2)*size + 2*this.config.moduleSize, this.config.backgroundImage, pos, grad, width, radius).then(()=>{
                this.addDesignHelper(finalCanvas, canvas, gradient);            
                return finalCanvas;
            });
        } else if( this.config.backgroundColor && this.config.backgroundColor.includes('rgba')) {
            finalCanvas.circle(size).attr({cx: pos,cy: pos, stroke:grad, 'stroke-width':width}).radius(radius).fill(color);
            finalCanvas.circle(size).attr({cx: pos,cy: pos}).radius(radius - width/2).fill(color);
            this.addDesignHelper(finalCanvas, canvas, gradient);
            return finalCanvas;
        } else {
            finalCanvas.circle(size).attr({cx: pos,cy: pos, stroke:grad, 'stroke-width':width}).radius(radius).fill(grad);
            finalCanvas.circle(Math.sqrt(2)*size + 2*this.config.moduleSize - width * 2).attr({cx : pos , cy : pos}).fill(color);
            this.addDesignHelper(finalCanvas , canvas, gradient);
            return finalCanvas;
        }
    }


    private getColorFromQrSvg(x : number , y : number , circularFrame = false ){

        let colorDark  = this.config.colorDark ;
        let colorLight  = this.config.colorLight ? this.config.colorLight : colorDark;
        let direction  = x;
        let lengthForGradient = circularFrame ? ((this.config.size)/Math.sqrt(2) + this.config.moduleSize/2)*2 : this.config.viewportSize ;

        switch ( this.config.gradientType){
            case GradientType.NONE : {
                colorLight = colorDark;
                break;
            }
            case GradientType.HORIZONTAL :  {
                direction = x ;
                break;
            }

            case GradientType.VERTICAL : {
                direction = y ;
                break ;
            }
        }

        if(this.config.gradientType && this.config.gradientType !== GradientType.NONE && this.config.gradientType !== GradientType.RADIAL){
            let color2 : number[] = this.hexToRgb(colorDark)
            let color1 : number[] = this.hexToRgb(colorLight);

            let weightOfColorOne = direction / lengthForGradient;
            if(weightOfColorOne >= 1 ){
                weightOfColorOne = 0.999;
            }
            if(weightOfColorOne <= 0 ){
                weightOfColorOne = 0.001;
            }


            const colorOneInRGB = this.getGradientColor( color1 , color2 , weightOfColorOne);
            let colorOneInHex = '#' + this.rgbToHex(colorOneInRGB[0] , colorOneInRGB[1] , colorOneInRGB[2]) ;
            if( colorOneInHex === '#0'){
                colorOneInHex = '#000000'
            }
            if(colorOneInHex[0] === '-'){
                colorOneInHex = '#FFFFFF'
            }
            if(colorOneInHex.length === 6){
                colorOneInHex = colorOneInHex[0] + '0' + colorOneInHex.slice(1)
            } 

            let weightOfColorTwo = (direction + this.config.moduleSize) / lengthForGradient;
            if(weightOfColorTwo > 1 ){
                weightOfColorTwo = 0.999;
            }
            if(weightOfColorTwo < 0 ){
                weightOfColorTwo = 0.001;
            }


            const colorTwoInRGB = this.getGradientColor( color1 , color2 , weightOfColorTwo);
            let colorTwoInHex = '#' + this.rgbToHex(colorTwoInRGB[0] , colorTwoInRGB[1] , colorTwoInRGB[2]) ;
            if( colorTwoInHex === '#0'){
                colorTwoInHex = '#000000'
            }
            if(colorTwoInHex[0] === '-'){
                colorTwoInHex = '#ffffff'
            }
            if(colorTwoInHex.length === 6){
                colorTwoInHex = colorTwoInHex[0] + '0' + colorTwoInHex.slice(1)
            }
             

            return colorOneInHex + ' ' + colorTwoInHex;

        } else if(this.config.gradientType === GradientType.RADIAL){
            let color1 : number[] = this.hexToRgb(colorDark)
            let color2 : number[] = this.hexToRgb(colorLight);
            const xFromCenter = Math.abs(x - lengthForGradient/2) ;
            const yFromCenter = Math.abs(y - lengthForGradient/2) ;
            direction = Math.sqrt ( xFromCenter * xFromCenter + yFromCenter * yFromCenter) - 50;
            let weightOfColorOne = direction / ( lengthForGradient / 2) <= 1 ? direction / ( lengthForGradient / 2) : 1;
            if(weightOfColorOne > 1 ){
                weightOfColorOne = 0.999;
            }
            if(weightOfColorOne < 0 ){
                weightOfColorOne = 0.001;
            }

            const colorOneInRGB = this.getGradientColor( color1 , color2 , weightOfColorOne);
            
            let colorOneInHex = '#' + this.rgbToHex(colorOneInRGB[0] , colorOneInRGB[1] , colorOneInRGB[2]) ;
            
            if( colorOneInHex === '#0'){
                colorOneInHex = '#000000'
            }
            if(colorOneInHex.length === 6){
                colorOneInHex = colorOneInHex[0] + '0' + colorOneInHex.slice(1)
            } 


            let weightOfColorTwo = direction / ( lengthForGradient / 2) <= 1 ? direction / ( lengthForGradient / 2) : 1;
            if(weightOfColorTwo > 1 ){
                weightOfColorTwo = 0.999;
            }
            if(weightOfColorTwo < 0 ){
                weightOfColorTwo = 0.001;
            }

            const colorTwoInRGB = this.getGradientColor( color1 , color2 , weightOfColorTwo);
            let colorTwoInHex = '#' + this.rgbToHex(colorTwoInRGB[0] , colorTwoInRGB[1] , colorTwoInRGB[2]) ;
           
            if( colorTwoInHex === '#0'){
                colorTwoInHex = '#000000'
            }
            if(colorTwoInHex.length === 6){
                colorTwoInHex = colorTwoInHex[0] + '0' + colorTwoInHex.slice(1)
            } 
             

            return colorOneInHex + ' ' + colorTwoInHex;
        } 
        return colorDark;
    }

    private rgbToHex(r: number, g: number, b: number) {
        if (r > 255 || g > 255 || b > 255 || r < 0 || g < 0 || b < 0) {
            console.error('Invalid color component');
        }
        let _r = r.toString(16);
        let _g = g.toString(16);
        let _b = b.toString(16);
        if( _r.length < 2){
            _r = "0" + _r;
        }
        if( _g.length < 2){
            _g = "0" + _g;
        }
        if( _b.length < 2){
            _b = "0" + _b;
        }
        return _r + _g + _b;
    }

    private async drawLogoImage(context: object) {
        if (!this.config.logoImage) {
            return;
        }
        await this.loadLogo( context)

        // ----------------------------------- Local testing ----------------------------------------

        // const fs = require('fs');
        //
        // try {
        //     const data = fs.readFileSync(__dirname + '/tests/phone-receiver.' + CanvasType.SVG.toLowerCase(), 'utf8');
        //     // console.log(data);
        //     // @ts-ignore
        //     context.svg(data.replace(/x="[a-z0-9_-]{1,15}"/, ``).replace(/y="[a-z0-9_-]{1,15}"/, ``).replace('<svg', `<svg width="${logoSize}" height="${logoSize}" x="${centreCoordinate + logoMargin / 2 + this.config.margin + this.shiftX}" y="${centreCoordinate + logoMargin / 2 + this.config.margin + this.shiftY}"`));
        //     // console.log(data);
        // } catch(e) {
        //     console.log('Error:', e.stack);
        // }
    }

    private async loadLogo( context: any) {
        const logoWidth = this.calculatedLogoWidth ;
        const logoHeight = this.calculatedLogoHeight ;
        const coordinateX = this.logoCordinateX ;
        const coordinateY = this.logoCordinateY ;
        if(this.config.logoImage){
            return isSvgFile(this.config.logoImage).then( async (isSvg: any) => {
                    if (isSvg) {
                        return fetch(this.config.logoImage)
                            .then((r: { text: () => void; }) => r.text())
                            .then( async (text: any) => {
                                const mainMargin = this.config.margin;
                                const logoSize = this.config.size;
        
                    
                                const coordinateX = this.shiftX +  0.5 * (this.config.size - logoWidth);
                                const coordinateY = this.shiftY +  0.5 * (this.config.size - logoHeight);
                                const centreCoordinateX = coordinateX - mainMargin;
                                const centreCoordinateY = coordinateY - mainMargin;
                                const color = this.config.backgroundColor ? this.config.backgroundColor : '#ffffff';
                                text = text.substring(text.indexOf('<svg'));
                                text = text.substring(0, text.indexOf('</svg>') + 6);
                                let extraText = '';
                                const headSvg = text.substring(0, text.indexOf('>') + 1);
                                if (headSvg.indexOf(' viewBox') === -1) {
                                    let width = 0, height = 0;
                                    if (headSvg.indexOf(' width') !== -1) {
                                        const widthIndex = headSvg.indexOf('"',headSvg.indexOf('width'));
                                        width = text.substring(widthIndex + 1, headSvg.indexOf('"', widthIndex + 1));
                                    }
                                    if (headSvg.indexOf(' height') !== -1) {
                                        const heightIndex = headSvg.indexOf('"',headSvg.indexOf('height'));
                                        height = text.substring(heightIndex + 1, headSvg.indexOf('"', heightIndex + 1))
                                    }
                                    if (width || height) {
                                        width = width ? width : height;
                                        height = height ? height : width;
                                    } else {
                                        width = centreCoordinateX + this.config.margin + this.shiftX + logoSize;
                                        height = centreCoordinateY + this.config.margin + this.shiftY + logoSize
                                    }
                                    extraText += ` viewBox="0 0 ${width} ${height }"`
                                }
                                if (headSvg.indexOf('x=') !== -1 || headSvg.indexOf('x =') !== -1) {
                                    text = text.replace(/x\s*=\s*"[+.a-zA-Z0-9_-]{1,100}"/, ``);
                                }
                                if (headSvg.indexOf('y=') !== -1 || headSvg.indexOf('y =') !== -1) {
                                    text = text.replace(/y\s*=\s*"[+.a-zA-Z0-9_-]{1,100}"/, ``);
                                }
                                if (headSvg.indexOf(' width') !== -1) {
                                    text = text.replace(/width\s*=\s*"[+.a-zA-Z0-9_-]{1,100}"/, ``);
                                }
                                if (headSvg.indexOf(' height') !== -1) {
                                    text = text.replace(/height\s*=\s*"[+.a-zA-Z0-9_-]{1,100}"/, ``);
                                }
                           
                                try{
                                    // @ts-ignore
                                   context.svg(text
                                    .replace('<svg', `<svg fill='#000'` + extraText + ` x="${coordinateX}" y="${coordinateY}" width="${logoWidth}" height="${logoHeight}"`));
                                } catch(e){
                                    await fetch(this.config.logoImage)
                                    .then(  (response : Response) => response.arrayBuffer())
                                    .then( async (array : ArrayBuffer) => {
                                        array = new Uint8Array(array);
                                        let jpegImage = await sharp(array).resize({ width : Math.round(logoWidth) , height : Math.round(logoHeight) , fit : 'fill'}).png();
                                        let buffer = await jpegImage.toBuffer();
                                        const stringifiedBuffer = Buffer.from(buffer).toString('base64');
                                        const contentType = 'png'
                                        const imageBase64 = `data:image/${contentType};base64,${stringifiedBuffer}`;

                                        // @ts-ignore
                                        // context.svg('<image x="'+coordinateX+'" y="'+coordinateY+'"  preserveAspectRatio="none" href="'+ imageBase64 +'"  height="'+ logoHeight +'px" width="'+ logoWidth +'px" />')   
                                        context.image('').size(logoWidth , logoHeight)
                                        .attr({ 'xlink:href': imageBase64 ,'preserveAspectRatio': 'none'})   
                                        .move(coordinateX , coordinateY)        
                                    }).catch(console.error.bind(console));
                                }
                            }).catch(console.error.bind(console));
                            
                    } else {
                        // @ts-ignore
                        let  imageBase64 =  await this.getImageBase64Data(this.config.logoImage)
                        //@ts-ignore
                        // context.svg('<image x="'+coordinateX+'" y="'+ coordinateY +'"  preserveAspectRatio="none" href="'+ imageBase64 +'" height="'+ logoHeight +'px" width="'+ logoWidth +'px" />')  ;   
                        context.image('').size(logoWidth , logoHeight)
                        .attr({ 'xlink:href': imageBase64, 'preserveAspectRatio': 'none' })   
                        .move(coordinateX , coordinateY)   
                    }
             })
        }
    }
    

    private async addBackground(context: object, size: number, backgroundImage?: string, backgroundColor?: string) {
        if (!backgroundImage) {
            if(backgroundColor) {
                let color = backgroundColor ? backgroundColor : '#ffffff';
                if(backgroundColor === 'rgba(255,255,255,0)'){
                    color = '#ffffff00'
                }
                // @ts-ignore
                context.rect(size,size).fill(color).move(this.shiftX,this.shiftY);
            }
            return;
        }
        this.config.backgroundColor = '';
        if(this.config.frameStyle === QRCodeFrame.CIRCULAR ) {
            return;
        }
        return this.addBackgroundImage(context, size, backgroundImage!);
    }

    private async addBackgroundImage(context: object, size: number, backgroundImage: string) {
        // @ts-ignore
        context.rect(size,size).move(this.shiftX, this.shiftY).fill('#ffffff')
        await isSvgFile(backgroundImage).then( async flag =>{
            if(flag){
                await fetch(backgroundImage)
                .then(  (response : Response) => response.arrayBuffer())
                .then( async (array : ArrayBuffer) => {
                    array = new Uint8Array(array);
                    let jpegImage = await sharp(array).resize({ width : size , height : size , fit : 'fill'}).png();
                    let buffer = await jpegImage.toBuffer();
                    const stringifiedBuffer = Buffer.from(buffer).toString('base64');
                    const contentType = 'png'
                    const imageBase64 = `data:image/${contentType};base64,${stringifiedBuffer}`;
                    // @ts-ignore
                    // context.svg('<image opacity="0.6" x="'+this.shiftX+'" y="'+this.shiftY+'"  preserveAspectRatio="none" href="'+ imageBase64 +'"  height="'+ size +'px" width="'+ size +'px" />') 
                    context.image('').size(size , size)
                    .attr({ 'xlink:href': imageBase64 , opacity : 0.6 , 'preserveAspectRatio': 'none' })   
                    .move(this.shiftX , this.shiftY)         
            
                })  
            } else {
                let imageBase64 = await this.getImageBase64Data(backgroundImage);
                //@ts-ignore
                //context.svg('<image opacity="0.6" x="'+this.shiftX+'" y="'+this.shiftY+'"  preserveAspectRatio="none" href="'+ imageBase64 +'" height="'+ size +'px" width="'+ size +'px" />')    
                context.image('').size(size , size)
                .attr({ 'xlink:href': imageBase64 , opacity : 0.6 , 'preserveAspectRatio': 'none' })   
                .move(this.shiftX , this.shiftY)      
            }
        })
    }
    private async getImageBase64Data(backgroundImage: string) {
        const imageUrlData = await fetch(backgroundImage);
        const buffer = await imageUrlData.arrayBuffer();
        const stringifiedBuffer = Buffer.from(buffer).toString('base64');
        let contentType = imageUrlData.headers.get('content-type');
        contentType =  contentType.substring(contentType.indexOf('/') + 1);
        const imageBase64 = `data:${contentType};base64,${stringifiedBuffer}`;
        return imageBase64;
    }

    private async addCircularBackgroundImage(context: object, size: number, backgroundImage: string, pos: number, grad: string, width: number, radius: number) {

        // @ts-ignore
        // context.circle(size).fill('#ffffff').attr({ opacity : 0.6})
        size = Math.floor(size);

        await fetch(backgroundImage)
                .then(  (response : Response) => response.arrayBuffer())
                .then( async (array : ArrayBuffer) => {
                    array = new Uint8Array(array);
                    let jpegImage = await sharp(array).resize({ width : size , height : size , fit : 'fill'}).png();
                    let buffer = await jpegImage.toBuffer();
                    const stringifiedBuffer = Buffer.from(buffer).toString('base64');
                    const contentType = 'png'
                    const imageBase64 = `data:image/${contentType};base64,${stringifiedBuffer}`;

                    //@ts-ignore
                    // let image = context.image(imageBase64);
                    // image.attr('preserveAspectRatio', 'none');
                    // image.size(size, size ).move(this.shiftX  , this.shiftY).attr({ opacity : 0.6})
                    //@ts-ignore
                    let image = context.image('').size(size , size)
                    .attr({ 'xlink:href': imageBase64 , opacity : 0.6 , 'preserveAspectRatio': 'none' })   
                    .move(this.shiftX, this.shiftY)  


                    //@ts-ignore
                    let circle = context.circle(size - width * 2).attr({cx : pos , cy : pos}).fill('#ffffff')
                    image.clipWith(circle)
                    return ;
        }).catch(
            ( error: any ) =>{
                console.error(error);
            }
        )
    }

    private fillMargin(context: object) {
        const margin = this.config.margin;
        const size = this.config.size;
        const viewportSize = this.config.viewportSize;

        if (this.config.whiteMargin) {
            const color = this.config.useOpacity ? '#ffffff' : '#ffffff99';
            if (this.config.useOpacity) {
                // @ts-ignore
                context.rect(size, margin).fill(color).move(-margin + this.shiftX, -margin + this.shiftY);
                // @ts-ignore
                context.rect(size, margin).fill(color).move(-margin + this.shiftX, viewportSize + this.shiftY);
                // @ts-ignore
                context.rect(margin, size).fill(color).move(viewportSize + this.shiftX, -margin + this.shiftY);
                // @ts-ignore
                context.rect(margin, size).fill(color).move(-margin + this.shiftX, -margin + this.shiftY);
            } else {
                // @ts-ignore
                context.rect(size, margin).fill(color).move(-margin + this.shiftX, -margin + this.shiftY).attr({opacity: 0.6});
                // @ts-ignore
                context.rect(size, margin).fill(color).move(-margin + this.shiftX, viewportSize + this.shiftY).attr({opacity: 0.6});
                // @ts-ignore
                context.rect(margin, size).fill(color).move(viewportSize + this.shiftX, -margin + this.shiftY).attr({opacity: 0.6});
                // @ts-ignore
                context.rect(margin, size).fill(color).move(-margin + this.shiftX, -margin + this.shiftY).attr({opacity: 0.6});
            }
        }
    }

    private async drawAlignPatterns(context: object, gradient: string) {
        const moduleCount = this.moduleCount;
        const xyOffset = (1 - this.config.dotScale) * 0.5;

        const dataPattern = this.config.dataPattern ? this.config.dataPattern : DataPattern.SQUARE;
        for (let row = 0; row < moduleCount; row++) {
            for (let col = 0; col < moduleCount; col++) {
                const bIsDark = this.isDark.bind(this)(row, col) || false; //  data dot is black or white ( should not be drawn )

                const isBlkPosCtr = (col < 8 && (row < 8 || row >= moduleCount - 8)) || (col >= moduleCount - 8 && row < 8); // data dot is behind an eye
                let bProtected =  (row === 6 || col === 6 || isBlkPosCtr )  // data dot is in timeline

                const patternPosition = this.patternPosition;
                for (let i = 0; i < patternPosition.length - 1; i++) {
                    bProtected = bProtected || (row >= patternPosition[i] - 2 && row <= patternPosition[i] + 2 && col >= patternPosition[i] - 2 && col <= patternPosition[i] + 2);
                } // data dot is alignment eye


                const nLeft = col * this.config.nSize + (bProtected ? 0 : xyOffset * this.config.nSize);
                const nTop = row * this.config.nSize + (bProtected ? 0 : xyOffset * this.config.nSize);

                let _isDataDotBehindLogo = false;
                if( this.config.logoBackground && this.config.logoImage ){
                    _isDataDotBehindLogo = this.isDataDotBehindLogo(nLeft , nTop );
                }
                if(_isDataDotBehindLogo ){
                    continue
                }

                if(this.isSmoothPattern){
                    if(this.TwoDArray[row][col]){
                        this.fillRectWithMask(
                            context,
                            nLeft,
                            nTop,
                            (bProtected ? (isBlkPosCtr ? 1 : 1) : this.config.dotScale) * this.config.nSize,
                            (bProtected ? (isBlkPosCtr ? 1 : 1) : this.config.dotScale) * this.config.nSize,
                            bIsDark,
                            dataPattern,
                            row,
                            col
                        );
                    }
                } else {
                    if (patternPosition.length === 0) {
                        // if align pattern list is empty, then it means that we don't need to leave room for the align patterns
                        if (!bProtected ) {
                            this.fillRectWithMask(
                                context,
                                nLeft,
                                nTop,
                                (bProtected ? (isBlkPosCtr ? 1 : 1) : this.config.dotScale) * this.config.nSize,
                                (bProtected ? (isBlkPosCtr ? 1 : 1) : this.config.dotScale) * this.config.nSize,
                                bIsDark,
                                dataPattern,
                                row,
                                col
                            );
                        }
                    } else {
                        let inAgnRange = col < moduleCount - 4 && col >= moduleCount - 4 - 5 && row < moduleCount - 4 && row >= moduleCount - 4 - 5; // data is major alignment eye
                        if ((!bProtected && !inAgnRange ) ) {
                            this.fillRectWithMask(
                                context,
                                nLeft,
                                nTop,
                                (bProtected ? (isBlkPosCtr ? 1 : 1) : this.config.dotScale) * this.config.nSize,
                                (bProtected ? (isBlkPosCtr ? 1 : 1) : this.config.dotScale) * this.config.nSize,
                                bIsDark,
                                dataPattern,
                                row,
                                col
                            );
                        }
                    }
                }
            }
        }
    }


    //Function to create data dots in QR.
    private async fillRectWithMask(canvas: object, x: number, y: number, w: number, h: number, bIsDark: boolean, shape: DataPattern,row : number, col : number) {
        let gradient ;
        
        
        gradient = this.getColorFromQrSvg(x , y ) ;

        if (!bIsDark) {
            return ;
        }

        if (!this.maskCanvas) {
            const color = bIsDark ? gradient : this.config.backgroundColor ? this.config.backgroundColor : this.config.useOpacity ? '#ffffff' : '#ffffff';

            if (!this.config.backgroundImage && !bIsDark) {
                return ;
            }

            switch (shape) {
                case DataPattern.CIRCLE:
                    this.drawCircle(x + w / 2, y + h / 2, canvas, color, h / 2, h / 2, !bIsDark);
                    break;
                case DataPattern.LEFT_DIAMOND:
                    this.drawDiamond(x, y, canvas, color, w, h, false, !bIsDark);
                    break;
                case DataPattern.RIGHT_DIAMOND:
                    this.drawDiamond(x, y, canvas, color, w, h, true, !bIsDark);
                    break;
                case DataPattern.KITE:
                    this.drawKite(x, y, canvas, color, w, h, false, !bIsDark);
                    break;
                case DataPattern.THIN_SQUARE:
                    this.drawThinSquare(x, y, canvas, color, w, h, false, !bIsDark);
                    break;
                case DataPattern.SMOOTH_ROUND:
                    this.drawSmoothRound(x, y, canvas, color, w, h, row, col, false, !bIsDark);
                    break;
                case DataPattern.SMOOTH_SHARP:
                    this.drawSmoothSharp(x, y, canvas, color, w, h, row, col, false, !bIsDark);
                    break;
                default:
                    this.drawSquare(x, y, canvas, w, h, false, color, !bIsDark);
                    break;
            }

        } else {
            // TODO: mask canvas
            // canvas.drawImage(this.maskCanvas, x, y, w, h, x, y, w, h);
            const color = bIsDark ? gradient : this.config.backgroundColor ? this.config.backgroundColor : this.config.useOpacity ? '#ffffff' : '#ffffff';
            this.drawSquare(x, y, canvas, w, h, false, color, !bIsDark);
        }
    }
    drawSmoothSharp(startX: number, startY: number, context: object, gradient: string, width: number, height: number, row : number, col : number, isRound?: boolean, isMask?: boolean) {
        let op = isMask ? 0.6 : 1;
        if(this.config.frameStyle === QRCodeFrame.CIRCULAR && this.config.backgroundImage && isMask) {
            op = 0.0;
        }
        let array = this.TwoDArray;
        if(!array[row][col])
            return;
        
        const maxWidth = this.TwoDArray[0].length;
        const maxHeight = this.TwoDArray.length;
        if(gradient.length > 7 ){
            // @ts-ignore
            gradient = context.gradient( 'linear',function(add){
                add.stop(0 , gradient.split(" ")[0])
                add.stop(1 , gradient.split(" ")[1])
            }).transform( { rotate : this.config.gradientType === GradientType.VERTICAL ? 90 : 0});
        } 

        let outerBorderRadiusPath = ''
        let size = this.config.moduleSize ;
        let dotPath = `M 0 ${size / 4} `

        // If checks when not to draw the curved path
        //Top Left
        if( 
            ( row == 0 && !array[row][col-1] ) ||
            ( col == 0 && !array[row - 1][col] ) ||
            ( !array[row][col-1] && !array[row-1][col] )
        )
            dotPath += ` A ${size / 4} ${size / 4} 0 0 1 ${size / 4 } 0 L ${ size * 3 / 4} 0 `
        else 
            dotPath += ` L 0 0 L ${size / 4 } 0 L ${ size * 3 / 4} 0 `
        
        if( row !== 0 &&
            col !== 0 &&
            row !== maxHeight - 1 &&
            col !== maxWidth -1 && 
            array[row-1][col-1] &&
            !( array[row-1][col] && array[row][col-1] ) 
        )  {

            if( array[row-1][col] ){
                outerBorderRadiusPath = `M 0 0 L -${size / 4} 0 A ${size / 4} ${size / 4} 0 0 1 0 ${size/4} L 0 0`
                // @ts-ignore
                context.path(outerBorderRadiusPath).move(startX + this.config.margin + this.shiftX - size / 4, startY + this.config.margin + this.shiftY).fill(gradient)
            }
            if( array[row][col-1] ){
                outerBorderRadiusPath = `M 0 0 L 0 -${size / 4} A ${size / 4} ${size / 4} 0 0 0 ${size/4} 0 L 0 0`
                // @ts-ignore
                context.path(outerBorderRadiusPath).move(startX + this.config.margin + this.shiftX , startY + this.config.margin + this.shiftY - size / 4).fill(gradient)
            }
            
        }
    
        //Top Right
        if( 
            ( row === 0 && !array[row][col+1] ) ||
            ( col === maxWidth - 1 && !array[row-1][col] ) ||
            ( !array[row][col+1] && !array[row-1][col])
        )
            dotPath += ` A ${size / 4} ${size / 4} 0 0 1 ${size  } ${ size / 4} L ${size} ${size * 3 / 4} `
        else 
            dotPath += ` L ${size} 0 L ${size} ${size / 4} L ${size} ${size * 3 / 4} `

        if( row !== 0 &&
            col !== 0 &&
            row !== maxHeight - 1 &&
            col !== maxWidth -1 && 
            array[row-1][col+1] &&
            !( array[row-1][col] && array[row][col+1] ) 
        ) {  
            
            if( array[row-1][col] ){
                outerBorderRadiusPath = `M 0 0 L ${size / 4} 0 A ${size / 4} ${size / 4} 0 0 0 0 ${size / 4} L 0 0`
                // @ts-ignore
                context.path(outerBorderRadiusPath).move(startX + this.config.margin + this.shiftX + size , startY + this.config.margin + this.shiftY).fill(gradient)    
            }
            if( array[row][col+1] ){
                outerBorderRadiusPath = `M 0 0 L 0 -${size / 4} A ${size / 4} ${size / 4} 0 0 1 -${size / 4}  0 L 0 0`
                // @ts-ignore
                context.path(outerBorderRadiusPath).move(startX + this.config.margin + this.shiftX + size * 3 / 4, startY + this.config.margin + this.shiftY - size / 4).fill(gradient)
            }
        }
        
        // Bottom Right
        if( 
            ( row === maxHeight - 1 && !array[row][col+1] ) ||
            ( col === maxWidth - 1 && !array[row+1][col] ) ||
            ( !array[row][col+1] && !array[row+1][col] )
        )
            dotPath += ` A ${size / 4} ${size / 4} 0 0 1 ${size * 3 / 4 } ${ size } L ${size / 4 } ${size} `
        else 
            dotPath += ` L ${size } ${size } L ${size * 3 / 4 } ${ size } L ${size / 4 } ${size} `
        if( row !== 0 &&
            col !== 0 &&
            row !== maxHeight - 1 &&
            col !== maxWidth -1 && 
            array[row+1][col+1] &&
            !( array[row+1][col] && array[row][col+1] ) 
        ) {  
            
            if( array[row+1][col] ){
                outerBorderRadiusPath = `M 0 0 L 0 -${size/4} A${size/4} ${size/4} 0 0 0 ${size/4} 0 L 0 0`
                // @ts-ignore
                context.path(outerBorderRadiusPath).move(startX + this.config.margin + this.shiftX + size , startY + this.config.margin + this.shiftY + size * 3 / 4).fill(gradient)    
            }
            if( array[row][col+1] ){
                outerBorderRadiusPath = `M 0 0 L -${size / 4} 0 A ${size / 4} ${size / 4} 0 0 1 0 ${size / 4}   L 0 0`
                // @ts-ignore
                context.path(outerBorderRadiusPath).move(startX + this.config.margin + this.shiftX + size * 3 / 4 , startY + this.config.margin + this.shiftY + size).fill(gradient)
            }
        }
    
        // Bottom Left
        if( 
            ( row === maxHeight - 1 && !array[row][col-1] ) ||
            ( col === 0 && !array[row+1][col] ) ||
            ( !array[row][col-1] && !array[row+1][col] )
        )
            dotPath += ` A ${size / 4} ${size / 4} 0 0 1 0 ${ size * 3 / 4 } L 0 ${size / 4} `
        else 
            dotPath += ` L ${0 } ${size } L ${0 } ${ size * 3 / 4 } L ${0 } ${size/4} `
        
        if( row !== 0 &&
            col !== 0 &&
            row !== maxHeight - 1 &&
            col !== maxWidth -1 && 
            array[row+1][col-1] &&
            !( array[row+1][col] && array[row][col-1] ) 
        ) {  
            
            if( array[row+1][col] ){
                outerBorderRadiusPath = `M 0 0 L  -${size/4} 0  A${size/4} ${size/4} 0 0 0 0 -${size/4}  L 0 0`
                // @ts-ignore
                context.path(outerBorderRadiusPath).move(startX + this.config.margin + this.shiftX - size / 4, startY + this.config.margin + this.shiftY + size * 3 / 4).fill(gradient)    
            }
            if( array[row][col-1] ){
                outerBorderRadiusPath = `M 0 0 L ${size / 4} 0 A ${size / 4} ${size / 4} 0 0 0 0 ${size / 4}   L 0 0`
                // @ts-ignore
                context.path(outerBorderRadiusPath).move(startX + this.config.margin + this.shiftX  , startY + this.config.margin + this.shiftY + size).fill(gradient)
            }
        }

        // @ts-ignore
        context.path(dotPath).fill(gradient).move(startX + this.config.margin + this.shiftX, startY + this.config.margin + this.shiftY).attr( { 'data-pos' : `${row} ${col}`})

    }
    drawSmoothRound(startX: number, startY: number, context: object, gradient: string, width: number, height: number, row : number, col : number, isRound?: boolean, isMask?: boolean) {
        let op = isMask ? 0.6 : 1;
        if(this.config.frameStyle === QRCodeFrame.CIRCULAR && this.config.backgroundImage && isMask) {
            op = 0.0;
        }
        let array = this.TwoDArray;
        if(!array[row][col])
            return;

        const maxWidth = this.TwoDArray[0].length ;
        const maxHeight = this.TwoDArray.length ;
        if(gradient.length > 7 ){
            // @ts-ignore
            gradient = context.gradient( 'linear',function(add){
                add.stop(0 , gradient.split(" ")[0])
                add.stop(1 , gradient.split(" ")[1])
            }).transform( { rotate : this.config.gradientType === GradientType.VERTICAL ? 90 : 0});
        } 
        let outerBorderRadiusPath = ''


        let size = this.config.moduleSize ;
        let dotPath = `M 0 ${size * 3 / 7} `

        // If checks when not to draw the curved path
        //Top Left
        if( 
            ( row == 0 && !array[row][col-1] ) ||
            ( col == 0 && !array[row - 1][col] ) ||
            ( !array[row][col-1] && !array[row-1][col] )
        ){
            dotPath += ` A ${size * 3 / 7 } ${size * 3 / 7} 0 0 1 ${ size * 3 / 7 } 0 L ${ size * 4 / 7} 0 `
        } else {
            dotPath += ` L 0 0 L ${size * 3 / 7 } 0 L ${ size * 4 / 7} 0 `
        }

        if( row !== 0 &&
            col !== 0 &&
            row !== maxHeight - 1 &&
            col !== maxWidth -1 && 
            array[row-1][col-1] &&
            !( array[row-1][col] && array[row][col-1] ) 
        )  {

            if( array[row-1][col] ){
                outerBorderRadiusPath = `M 0 0 L -${size * 3 / 7} 0 A ${size * 3 / 7} ${size * 3 / 7} 0 0 1 0 ${ size * 3 / 7} L 0 0`
                // @ts-ignore
                context.path(outerBorderRadiusPath).move(startX + this.config.margin + this.shiftX - size * 3 / 7, startY + this.config.margin + this.shiftY).fill(gradient)
            }
            if( array[row][col-1] ){
                outerBorderRadiusPath = `M 0 0 L 0 -${size * 3 / 7} A ${size * 3 / 7} ${size * 3 / 7} 0 0 0 ${size * 3 / 7} 0 L 0 0`
                // @ts-ignore
                context.path(outerBorderRadiusPath).move(startX + this.config.margin + this.shiftX , startY + this.config.margin + this.shiftY - size * 3 / 7).fill(gradient)
            }
            
        }

    
        //Top Right
        if( 
            ( row === 0 && !array[row][col+1] ) ||
            ( col === maxWidth - 1 && !array[row-1][col] ) ||
            ( !array[row][col+1] && !array[row-1][col])
        )
            dotPath += ` A ${size * 3 / 7} ${size * 3 / 7} 0 0 1 ${size } ${ size * 3 / 7} L ${size} ${size * 4 / 7} `
        else 
            dotPath += ` L ${size} 0 L ${size} ${size * 3 / 7} L ${size} ${size * 4 / 7} `

        if( row !== 0 &&
            col !== 0 &&
            row !== maxHeight - 1 &&
            col !== maxWidth - 1 && 
            array[row-1][col+1] &&
            !( array[row-1][col] && array[row][col+1] ) 
        ) {  
            
            if( array[row-1][col] ){
                outerBorderRadiusPath = `M 0 0 L ${size * 3 / 7} 0 A ${size * 3 / 7} ${size * 3 / 7} 0 0 0 0 ${size * 3/ 7} L 0 0`
                // @ts-ignore
                context.path(outerBorderRadiusPath).move(startX + this.config.margin + this.shiftX + size , startY + this.config.margin + this.shiftY).fill(gradient)    
            }
            if( array[row][col+1] ){
                outerBorderRadiusPath = `M 0 0 L 0 -${size * 3 / 7} A ${size * 3 / 7} ${size * 3 / 7} 0 0 1 -${size * 3 / 7}  0 L 0 0`
                // @ts-ignore
                context.path(outerBorderRadiusPath).move(startX + this.config.margin + this.shiftX + size * 4 / 7, startY + this.config.margin + this.shiftY - size * 3 / 7).fill(gradient)
            }
        }
    
        
        // Bottom Right
        if( 
            ( row === maxHeight - 1 && !array[row][col+1] ) ||
            ( col === maxWidth - 1 && !array[row+1][col] ) ||
            ( !array[row][col+1] && !array[row+1][col] )
        )
            dotPath += ` A ${size * 3 / 7} ${size * 3 / 7} 0 0 1 ${size * 4 / 7 } ${ size } L ${size * 3 / 7 } ${size} `
        else 
            dotPath += ` L ${size } ${size } L ${size * 4 / 7 } ${ size } L ${size * 3 / 7 } ${size} `

        if( row !== 0 &&
            col !== 0 &&
            row !== maxHeight - 1 &&
            col !== maxWidth -1 && 
            array[row+1][col+1] &&
            !( array[row+1][col] && array[row][col+1] ) 
        ) {  
            
            if( array[row+1][col] ){
                outerBorderRadiusPath = `M 0 0 L 0 -${size * 3 / 7 } A${size * 3 / 7} ${size * 3 / 7} 0 0 0 ${size * 3 / 7} 0 L 0 0`
                // @ts-ignore
                context.path(outerBorderRadiusPath).move(startX + this.config.margin + this.shiftX + size , startY + this.config.margin + this.shiftY + size * 4 / 7).fill(gradient)    
            }
            if( array[row][col+1] ){
                outerBorderRadiusPath = `M 0 0 L -${size * 3 / 7} 0 A ${size * 3 / 7} ${size * 3 / 7} 0 0 1 0 ${size * 3 / 7}   L 0 0`
                // @ts-ignore
                context.path(outerBorderRadiusPath).move(startX + this.config.margin + this.shiftX + size * 4 / 7 , startY + this.config.margin + this.shiftY + size).fill(gradient)
            }
        }
        

        // Bottom Left
        if( 
            ( row === maxHeight -1 && !array[row][col-1] ) ||
            ( col === 0 && !array[row+1][col] ) ||
            ( !array[row][col-1] && !array[row+1][col] )
        )
            dotPath += ` A ${size * 3 / 7} ${size * 3 / 7} 0 0 1 0 ${ size * 4 / 7 } L 0 ${size * 3 / 7} `
        else 
            dotPath += ` L ${0 } ${size } L ${0 } ${ size * 4 / 7 } L ${0 } ${size * 3 / 7} `

        if( row !== 0 &&
            col !== 0 &&
            row !== maxHeight - 1 &&
            col !== maxWidth -1 && 
            array[row+1][col-1] &&
            !( array[row+1][col] && array[row][col-1] ) 
        ) {  
            
            if( array[row+1][col] ){
                outerBorderRadiusPath = `M 0 0 L  -${size * 3 / 7} 0  A${ size * 3 / 7} ${size * 3 / 7} 0 0 0 0 -${size * 3 / 7}  L 0 0`
                // @ts-ignore
                context.path(outerBorderRadiusPath).move(startX + this.config.margin + this.shiftX - size * 3 / 7, startY + this.config.margin + this.shiftY + size * 4 / 7).fill(gradient)    
            }
            if( array[row][col-1] ){
                outerBorderRadiusPath = `M 0 0 L ${size * 3 / 7} 0 A ${size * 3 / 7} ${size * 3 / 7} 0 0 0 0 ${size * 3 / 7}   L 0 0`
                // @ts-ignore
                context.path(outerBorderRadiusPath).move(startX + this.config.margin + this.shiftX  , startY + this.config.margin + this.shiftY + size).fill(gradient)
            }
        }
        // @ts-ignore
        context.path(dotPath).fill(gradient).move(startX + this.config.margin + this.shiftX, startY + this.config.margin + this.shiftY).attr( { 'data-pos' : `${row} ${col}`})
    }

    private drawAlignProtectors(context: object , disable : boolean = true) {

        if(this.isSmoothPattern)
            return;
        if(disable){
            return ;
        }
        if (!this.config.backgroundImage && !this.config.backgroundColor) {
            return;
        }
        const patternPosition = this.patternPosition;
        const moduleSize = this.config.moduleSize;
        const margin = this.config.margin;
        // const color = '#0E9E88';
        const color = this.config.backgroundColor ? this.config.backgroundColor : this.config.useOpacity ? '#ffffff' : '#ffffff99';
        const edgeCenter = patternPosition[patternPosition.length - 1];
        for (let i = 0; i < patternPosition.length; i++) {
            for (let j = 0; j < patternPosition.length; j++) {
                const agnX = patternPosition[j];
                const agnY = patternPosition[i];
                if (agnX === 6 && (agnY === 6 || agnY === edgeCenter)) {
                } else if (agnY === 6 && (agnX === 6 || agnX === edgeCenter)) {
                } else if (agnX !== 6 && agnX !== edgeCenter && agnY !== 6 && agnY !== edgeCenter) {
                    CanvasUtil.drawSVGAlignProtector(context, agnX, agnY, moduleSize, moduleSize, margin, color, this.shiftX, this.shiftY, this.config.useOpacity);
                } else {
                    CanvasUtil.drawSVGAlignProtector(context, agnX, agnY, moduleSize, moduleSize, margin, color, this.shiftX, this.shiftY, this.config.useOpacity);
                }
            }
        }
    }

    private async drawPositionPatterns(context: object, gradient: string ) {

        const moduleSize = this.config.moduleSize;
        const moduleCount = this.moduleCount;

        const eyeBallColor = this.config.eyeBallColor ? this.config.eyeBallColor : gradient;
        const eyeBallShape = this.config.eyeBallShape ? this.config.eyeBallShape : EyeBallShape.SQUARE;
        const eyeFrameColor = this.config.eyeFrameColor ? this.config.eyeFrameColor : gradient;
        const eyeFrameShape = this.config.eyeFrameShape ? this.config.eyeFrameShape : EyeFrameShape.SQUARE;
        const dataPattern = this.config.dataPattern ? this.config.dataPattern : DataPattern.SQUARE;

        await this.drawEyes(context , eyeFrameShape , eyeFrameColor , eyeBallShape , eyeBallColor)


        // For drawing timeline
        if(!this.isSmoothPattern){
            for (let i = 0; i < moduleCount - 15; i += 2) {
                const dotSize = moduleSize * this.config.dotScale;
                const sizeDifferenceAfterDotScale = moduleSize - dotSize;
                let leftTimelineX = 6 * moduleSize + sizeDifferenceAfterDotScale / 2 ;
                let leftTimelineY = (8 + i) * moduleSize + sizeDifferenceAfterDotScale / 2 ;
                let topTimelineX = (8 + i) * moduleSize + sizeDifferenceAfterDotScale / 2;
                let topTimelineY = 6 * moduleSize + sizeDifferenceAfterDotScale / 2;
                switch (dataPattern) {
                    case DataPattern.CIRCLE:
                        const radius = dotSize / 2;
                        gradient = this.getColorFromQrSvg(topTimelineX + radius, topTimelineY + radius);
                        this.drawCircle(topTimelineX + radius, topTimelineY + radius, context, gradient, radius, radius, false);
                        gradient = this.getColorFromQrSvg( leftTimelineX + radius, leftTimelineY + radius);
                        this.drawCircle(leftTimelineX + radius, leftTimelineY + radius, context, gradient, radius, radius, false);
                        break;
                    case DataPattern.KITE:
                        gradient = this.getColorFromQrSvg(topTimelineX, topTimelineY);
                        this.drawKite(topTimelineX, topTimelineY, context, gradient, dotSize, dotSize, false);
                        gradient = this.getColorFromQrSvg( leftTimelineX, leftTimelineY);
                        this.drawKite(leftTimelineX, leftTimelineY, context, gradient, dotSize, dotSize, false);
                        break;
                    case DataPattern.LEFT_DIAMOND:
                        gradient = this.getColorFromQrSvg( topTimelineX, topTimelineY);
                        this.drawDiamond(topTimelineX, topTimelineY, context, gradient, dotSize, dotSize, false);
                        gradient = this.getColorFromQrSvg( leftTimelineX, leftTimelineY);
                        this.drawDiamond(leftTimelineX, leftTimelineY, context, gradient, dotSize, dotSize, false);
                        break;
                    case DataPattern.RIGHT_DIAMOND:
                        gradient = this.getColorFromQrSvg( topTimelineX, topTimelineY);
                        this.drawDiamond(topTimelineX, topTimelineY, context, gradient, dotSize, dotSize, true);
                        gradient = this.getColorFromQrSvg( leftTimelineX, leftTimelineY);
                        this.drawDiamond(leftTimelineX, leftTimelineY, context, gradient, dotSize, dotSize, true);
                        break;
                    case DataPattern.THIN_SQUARE:
                        gradient = this.getColorFromQrSvg(topTimelineX, topTimelineY);
                        this.drawThinSquare(topTimelineX, topTimelineY, context, gradient, dotSize, dotSize, false);
                        gradient = this.getColorFromQrSvg( leftTimelineX, leftTimelineY);
                        this.drawThinSquare(leftTimelineX, leftTimelineY, context, gradient, dotSize, dotSize, false);
                        break;
                    default:
                        gradient = this.getColorFromQrSvg( topTimelineX, topTimelineY);
                        this.drawSquare(topTimelineX, topTimelineY, context, dotSize, dotSize, false, gradient);
                        gradient = this.getColorFromQrSvg( leftTimelineX, leftTimelineY);
                        this.drawSquare(leftTimelineX, leftTimelineY, context, dotSize, dotSize, false, gradient);
    
                }
            }
        }

        // For drawing alignment eyes ( small eyes)
        const patternPosition = this.patternPosition;
        const edgeCenter = patternPosition[patternPosition.length - 1];
        for (let i = 0; i < patternPosition.length; i++) {
            for (let j = 0; j < patternPosition.length; j++) {
                const agnX = patternPosition[j];
                const agnY = patternPosition[i];
                
                // Checking if alignment eye is behind logo
                let isEyeBehindLogo = false
                let leftTop = { 
                    x : this.config.margin + (agnX - 2) * this.config.moduleSize,
                    y : this.config.margin + (agnY - 2) * this.config.moduleSize
                }
                isEyeBehindLogo = isEyeBehindLogo ||  this.isDataDotBehindLogo(leftTop.x , leftTop.y);
                let leftBottom = {
                    x : this.config.margin + (agnX - 2) * this.config.moduleSize,
                    y : this.config.margin + (agnY + 2) * this.config.moduleSize
                }
                isEyeBehindLogo = isEyeBehindLogo ||  this.isDataDotBehindLogo(leftBottom.x , leftBottom.y);
                let rightTop = {
                    x : this.config.margin + (agnX + 2) * this.config.moduleSize,
                    y : this.config.margin + (agnY - 2) * this.config.moduleSize
                }
                isEyeBehindLogo = isEyeBehindLogo ||  this.isDataDotBehindLogo(rightTop.x , rightTop.y);
                let rightBottom = {
                    x : this.config.margin + (agnX + 2) * this.config.moduleSize,
                    y : this.config.margin + (agnY + 2) * this.config.moduleSize
                }
                isEyeBehindLogo = isEyeBehindLogo ||  this.isDataDotBehindLogo(rightBottom.x , rightBottom.y);

                if(isEyeBehindLogo) continue;
                if (agnX === 6 && (agnY === 6 || agnY === edgeCenter)) {
                } else if (agnY === 6 && (agnX === 6 || agnX === edgeCenter)) {
                } else if (agnX !== 6 && agnX !== edgeCenter && agnY !== 6 && agnY !== edgeCenter) {
                    await this.drawAlign(context, agnX, agnY, moduleSize, moduleSize, dataPattern);
                } else {
                    await this.drawAlign(context, agnX, agnY, moduleSize, moduleSize, dataPattern);
                }
            }
        }
    }
    async drawEyes(context: object, eyeFrameShape: EyeFrameShape, eyeFrameColor: string, eyeBallShape: EyeBallShape, eyeBallColor: string) {

        /*
            CALCULATION
                - The eye frame has dimensions equal to 7 modules 
                - The eye ball has dimensions equal to 3 modules
                - The width of eye frame is equal to 1 module
                - The Gap between the eyeball and eyeFrame is 1 module 

                - Size of 1 module is referred as `moduleSize`
        */

        
        // ---- Step 1 : Create SVG canvas for eye frame

        const { createSVGWindow } = eval('require')('svgdom');
        const eyeFrameWindow = createSVGWindow();
        const eyeFrameDocument = eyeFrameWindow.document;
        registerWindow(eyeFrameWindow, eyeFrameDocument);
        // @ts-ignore
        let eyeFrameCanvas = SVG(eyeFrameDocument.documentElement).size( 7 * this.config.moduleSize , 7 * this.config.moduleSize ).viewbox(0,0,7 * this.config.moduleSize , 7 * this.config.moduleSize);

        // ---- Step 2 : Add eye frame path to eye frame Canvas
        let width = 7 * this.config.moduleSize ;
        let height = 7 * this.config.moduleSize ;
        let moduleSize = this.config.moduleSize ;
        let radius = height / 4 ;
        let reducedRadius = radius - moduleSize ;


        // ----- Step 2.1 : Generate frame path
        let framePath ;
        switch ( eyeFrameShape ) {
            case EyeFrameShape.SQUARE :
                framePath = `   M0 0 L${width} 0 L${width} ${height} L${0} ${height} L0 0 Z
                                M${moduleSize} ${moduleSize} L${moduleSize} ${height - moduleSize} L${width - moduleSize} ${height - moduleSize} L${width - moduleSize} ${moduleSize} L${moduleSize} ${moduleSize} Z`
                break;
            case EyeFrameShape.ROUNDED :
                framePath = `   M${0.25 * width} 0 L${0.75 * width} 0 A${radius} ${radius} 0 0 1 ${width} ${0.25 * height } L${width} ${0.75 * height} A${radius} ${radius} 0 0 1 ${0.75 * width} ${ height } L${0.25 * width} ${ height}  A${radius} ${radius} 0 0 1 ${0} ${ 0.75 * height } L${ 0 } ${ 0.25 * height} A${radius} ${radius} 0 0 1 ${0.25 * width} ${ 0 } Z `
                framePath += ` M${0.25 * width} ${moduleSize} A${reducedRadius} ${reducedRadius} 0 0 0 ${moduleSize} ${0.25 * height}  L${moduleSize} ${0.75 * height} A${reducedRadius} ${reducedRadius} 0 0 0 ${0.25 * width} ${height - moduleSize} L${0.75 * width} ${height - moduleSize} A${reducedRadius} ${reducedRadius} 0 0 0 ${width - moduleSize} ${0.75 * height} L${ width - moduleSize } ${ 0.25 * height} A${reducedRadius} ${reducedRadius} 0 0 0 ${ 0.75 * width } ${ moduleSize} L${0.25 * width} ${moduleSize} Z`
                break;
            case EyeFrameShape.LEFT_LEAF :
                radius = height / 3 ;
                reducedRadius = radius - moduleSize;
                framePath = `   M${0.33 * width} 0 L${0.67 * width} 0 A${radius} ${radius} 0 0 1 ${width} ${0.33 * height } L${width} ${height}  L${0.33 * width} ${ height}  A${radius} ${radius} 0 0 1 ${0} ${ 0.67 * height } L${ 0 } ${ 0} L${0.33 * width} 0 Z `
                framePath += ` M${moduleSize} ${moduleSize} L${moduleSize} ${0.67 * height} A${reducedRadius} ${reducedRadius} 0 0 0 ${0.33 * width} ${height - moduleSize} L${width - moduleSize} ${height - moduleSize} L${ width - moduleSize } ${ 0.33 * height} A${reducedRadius} ${reducedRadius} 0 0 0 ${ 0.67 * width } ${ moduleSize} L${0.33 * width} ${moduleSize} Z`
                break;
            case EyeFrameShape.RIGHT_LEAF :
                radius = height / 3 ;
                reducedRadius = radius - moduleSize;
                framePath = `   M${0.33 * width} 0 L${width} 0 L${width} ${0.67 * height} A${radius} ${radius} 0 0 1 ${0.67 * width} ${ height } L${0} ${ height} L${ 0 } ${ 0.33 * height} A${radius} ${radius} 0 0 1 ${0.33 * width} ${ 0 } Z `
                framePath += ` M${0.33 * width} ${moduleSize} A${reducedRadius} ${reducedRadius} 0 0 0 ${moduleSize} ${0.33 * height}  L${moduleSize} ${height - moduleSize}  L${0.67 * width} ${height - moduleSize} A${reducedRadius} ${reducedRadius} 0 0 0 ${width - moduleSize} ${0.67 * height} L${ width - moduleSize } ${ moduleSize }  L${0.33 * width} ${moduleSize} Z`
                break;
            case EyeFrameShape.CIRCLE :
                framePath = `   M${0} ${height/2} A${width/2} ${width/2} 0 0 0 ${ width} ${height/2 } A${width/2} ${width/2} 0 0 0 ${ 0} ${height/2 } Z 
                                M${ moduleSize} ${height/2} A${(width - 2 * moduleSize)/2} ${(width - 2 * moduleSize)/2} 0 0 1 ${ width - moduleSize} ${height/2 } A${(width - 2 * moduleSize)/2} ${(width - 2 * moduleSize)/2} 0 0 1 ${ moduleSize} ${height/2 }`
                break ;
            default :
                framePath = `   M0 0 L${width} 0 L${width} ${height} L${0} ${height} L0 0 Z
                            M${moduleSize} ${moduleSize} L${moduleSize} ${height - moduleSize} L${width - moduleSize} ${height - moduleSize} L${width - moduleSize} ${moduleSize} L${moduleSize} ${moduleSize} Z`
                break;


        }

        // ----- Step 2.2 : Add Generated path to eyeFrame Canvas
        eyeFrameCanvas.path(framePath).fill(eyeFrameColor).stroke({ width : 10})

        // --- Step 3 : Add eyeFrame canvas to main Canvas for 3 eyes

        // Top Left Eye
        eyeFrameCanvas.move(0 + this.config.margin + this.shiftX ,0 + this.config.margin + this.shiftY)
        // @ts-ignore
        context.add(eyeFrameCanvas.svg())

        // Top Right Eye
        eyeFrameCanvas.move(0 + this.config.margin + this.shiftX + ( this.moduleCount - 7) * moduleSize ,0 + this.config.margin + this.shiftY)
        // @ts-ignore
        context.add(eyeFrameCanvas.svg())

        // Bottom Left Eye
        eyeFrameCanvas.move(0 + this.config.margin + this.shiftX ,0 + this.config.margin + this.shiftY + + ( this.moduleCount - 7) * moduleSize)
        // @ts-ignore
        context.add(eyeFrameCanvas.svg())



        // ---- Step 1 : Create SVG canvas for eye ball

        const eyeBallWindow = createSVGWindow();
        const eyeBallDocument = eyeBallWindow.document;
        registerWindow(eyeBallWindow, eyeBallDocument);

        // @ts-ignore
        let eyeBallCanvas = SVG(eyeBallDocument.documentElement).size( 3 * this.config.moduleSize , 3 * this.config.moduleSize );


        let eyeBallPath ;
        // ---- Step 2 : Add eye balls  to eyeBall Canvas
        switch ( eyeBallShape) {
            case EyeBallShape.SQUARE :
                eyeBallCanvas.rect(3 * moduleSize , 3 * moduleSize ).fill(eyeBallColor)
                break ;
            case EyeBallShape.ROUNDED : 
                eyeBallCanvas.rect(3 * moduleSize , 3 * moduleSize).fill(eyeBallColor).radius(3 * moduleSize / 4)
                break ;
            case EyeBallShape.CIRCLE  :
                eyeBallCanvas.circle(3 * moduleSize).fill(eyeBallColor)
                break ;
            case EyeBallShape.LEFT_DIAMOND :
                eyeBallPath = `M0 0 L${1.5 * moduleSize} 0 L${ 3 * moduleSize } ${ 1.5 * moduleSize} L${3 * moduleSize} ${ 3 * moduleSize} L${ 1.5 * moduleSize } ${ 3 * moduleSize } L${0} ${ 1.5 * moduleSize } L0 0 Z`
                eyeBallCanvas.path(eyeBallPath).fill(eyeBallColor);
                break;
            case EyeBallShape.RIGHT_DIAMOND :
                eyeBallPath = `M${ 3 * moduleSize } ${ 0} L${ 3 * moduleSize } ${ 1.5 * moduleSize} L${ 1.5 * moduleSize } ${ 3 * moduleSize } L${0} ${ 3 * moduleSize} L${0} ${ 1.5 * moduleSize } L${ 1.5 * moduleSize} ${0} L${ 3 * moduleSize } ${ 0}  Z`
                eyeBallCanvas.path(eyeBallPath).fill(eyeBallColor);
                break;
            case EyeBallShape.LEFT_LEAF :
                eyeBallCanvas.circle(3 * moduleSize).fill(eyeBallColor)
                eyeBallPath = `M0 0 L${1.5 * moduleSize} 0 L${ 3 * moduleSize } ${ 1.5 * moduleSize} L${3 * moduleSize} ${ 3 * moduleSize} L${ 1.5 * moduleSize } ${ 3 * moduleSize } L${0} ${ 1.5 * moduleSize } L0 0 Z`
                eyeBallCanvas.path(eyeBallPath).fill(eyeBallColor);
                break;
            case EyeBallShape.RIGHT_LEAF :
                eyeBallCanvas.circle(3 * moduleSize).fill(eyeBallColor)
                eyeBallPath = `M${ 3 * moduleSize } ${ 0} L${ 3 * moduleSize } ${ 1.5 * moduleSize} L${ 1.5 * moduleSize } ${ 3 * moduleSize } L${0} ${ 3 * moduleSize} L${0} ${ 1.5 * moduleSize } L${ 1.5 * moduleSize} ${0} L${ 3 * moduleSize } ${ 0}  Z`
                eyeBallCanvas.path(eyeBallPath).fill(eyeBallColor);
                break;
        }



        // --- Step 3 : Add eyeBall canvas to main Canvas for 3 eyes

         // Top Left Eye
         eyeBallCanvas.move(0 + this.config.margin + this.shiftX + 2 * moduleSize,0 + this.config.margin + this.shiftY + 2 * moduleSize)
         // @ts-ignore
         context.add(eyeBallCanvas.svg())
 
         // Top Right Eye
         eyeBallCanvas.move(0 + this.config.margin + this.shiftX + ( this.moduleCount - 7) * moduleSize + 2 * moduleSize,0 + this.config.margin + this.shiftY + 2 * moduleSize)
         // @ts-ignore
         context.add(eyeBallCanvas.svg())
 
         // Bottom Left Eye
         eyeBallCanvas.move(0 + this.config.margin + this.shiftX + 2 * moduleSize ,0 + this.config.margin + this.shiftY + + ( this.moduleCount - 7) * moduleSize + 2 * moduleSize)
         // @ts-ignore
         context.add(eyeBallCanvas.svg())

    }


    private async drawAlign(context: object, centerX: number, centerY: number, nWidth: number, nHeight: number, shape: DataPattern) {
        let drawShape;
        let boolFlag: boolean = false;
        drawShape = this.drawSquare.bind(this);

        switch (shape) {
            case DataPattern.CIRCLE:
                drawShape = this.drawCircle.bind(this);
                break;
            case DataPattern.SQUARE:
                drawShape = this.drawSquare.bind(this);
                break;
            case DataPattern.KITE:
                drawShape = this.drawKite.bind(this);
                break;
            case DataPattern.LEFT_DIAMOND:
                drawShape = this.drawDiamond.bind(this);
                break;
            case DataPattern.RIGHT_DIAMOND:
                drawShape = this.drawDiamond.bind(this);
                boolFlag = true;
                break;
            case DataPattern.THIN_SQUARE:
                drawShape = this.drawThinSquare.bind(this);
                break;
            default:
                drawShape = this.drawSquare.bind(this);
                break;
        }


        let x = shape === DataPattern.CIRCLE ? (centerX - 2) * nWidth + nWidth / 2 : (centerX - 2) * nWidth;
        let y = shape === DataPattern.CIRCLE ? (centerY - 2) * nHeight + nHeight / 2 : (centerY - 2) * nHeight;
        let originalHeight = shape === DataPattern.CIRCLE ? nHeight  / 2 : nHeight;
        let originalWidth = shape === DataPattern.CIRCLE ? nWidth / 2 : nWidth;
        let height = originalHeight * this.config.dotScale;
        let width = originalWidth * this.config.dotScale;
        x = x + ( originalWidth - width) / 2
        y = y + ( originalHeight - height ) / 2


        for (let i = 0; i < 4; i++) {
            let gr = this.getColorFromQrSvg( x, y);
            if (shape === DataPattern.SQUARE) {
                // @ts-ignore
                drawShape(x, y, context, width, height, boolFlag, gr);
            } else {
                // @ts-ignore
                drawShape(x, y, context, gr, width, height, boolFlag);
            }

            y += nHeight;
        }

        x = shape === DataPattern.CIRCLE ? (centerX + 2) * nWidth + nWidth / 2 : (centerX + 2) * nWidth;
        y = shape === DataPattern.CIRCLE ? (centerY - 2 + 1) * nHeight + nHeight / 2 : (centerY - 2 + 1) * nHeight;
        x = x + ( originalWidth - width) / 2
        y = y + ( originalHeight - height ) / 2


        for (let i = 0; i < 4; i++) {
            let gr = this.getColorFromQrSvg( x, y);
            if (shape === DataPattern.SQUARE) {
                // @ts-ignore
                drawShape(x, y, context, width, height, boolFlag, gr);
            } else {
                // @ts-ignore
                drawShape(x, y, context, gr, width, height, boolFlag);
            }

            y += nHeight;
        }

        x = shape === DataPattern.CIRCLE ? (centerX - 2 + 1) * nWidth + nWidth / 2 : (centerX - 2 + 1) * nWidth;
        y = shape === DataPattern.CIRCLE ? (centerY - 2) * nHeight + nHeight / 2 : (centerY - 2) * nHeight;
        x = x + ( originalWidth - width) / 2
        y = y + ( originalHeight - height ) / 2


        for (let i = 0; i < 4; i++) {
            let gr = this.getColorFromQrSvg( x, y);
            if (shape === DataPattern.SQUARE) {
                // @ts-ignore
                drawShape(x, y, context, width, height, boolFlag, gr);
            } else {
                // @ts-ignore
                drawShape(x, y, context, gr, width, height, boolFlag);
            }
            x += nWidth;
        }

        x = shape === DataPattern.CIRCLE ? (centerX - 2) * nWidth + nWidth / 2 : (centerX - 2) * nWidth;
        y = shape === DataPattern.CIRCLE ? (centerY + 2) * nHeight + nHeight / 2 : (centerY + 2) * nHeight;
        x = x + ( originalWidth - width) / 2
        y = y + ( originalHeight - height ) / 2


        for (let i = 0; i < 4; i++) {
            let gr = this.getColorFromQrSvg( x , y );
            if (shape === DataPattern.SQUARE) {
                // @ts-ignore
                drawShape(x, y, context, width, height, boolFlag, gr);
            } else {
                // @ts-ignore
                drawShape(x, y, context, gr, width, height, boolFlag);
            }
            x += nWidth;
        }

        x = shape === DataPattern.CIRCLE ? centerX * nWidth + nWidth / 2 : centerX * nWidth;
        y = shape === DataPattern.CIRCLE ? centerY * nHeight + nHeight / 2 : centerY * nHeight;
        x = x + ( originalWidth - width) / 2
        y = y + ( originalHeight - height ) / 2

        let gr = this.getColorFromQrSvg( x, y);

        if (shape === DataPattern.SQUARE) {
            // @ts-ignore
            drawShape(x, y, context, width, height, boolFlag, gr);
        } else {
            // @ts-ignore
            drawShape(x, y, context, gr, width, height, boolFlag);
        }
    }

 
    private drawSquare(startX: number, startY: number, canvas: object, width: number, height: number, isRound: boolean, gradient: string , isMask?: boolean) {
        let op = isMask ? 0.6 : 1;
        if(this.config.frameStyle === QRCodeFrame.CIRCULAR && this.config.backgroundImage && isMask) {
            op = 0.0;
        }
        
        if(gradient.length > 7 ){
            // @ts-ignore
            gradient = canvas.gradient( 'linear',function(add){
                add.stop(0 , gradient.split(" ")[0])
                add.stop(1 , gradient.split(" ")[1])
            }).transform( { rotate : this.config.gradientType === GradientType.VERTICAL ? 90 : 0});
        } 
        let rotate = 0;
        if (isRound) {
            if (this.config.useOpacity) {
                // @ts-ignore
                canvas.rect(height, width).radius(height / 4)
                    .fill(gradient).move(startX + this.config.margin + this.shiftX, startY + this.config.margin + this.shiftY).attr({opacity: op});
            } else {
                // @ts-ignore
                    canvas.rect(height, width).radius(height / 4)
                    .fill(gradient).move(startX + this.config.margin + this.shiftX, startY + this.config.margin + this.shiftY);
            }
            return;
        }
        if (this.config.useOpacity) {
            //@ts-ignore
            canvas.rect(height, width).
            move(startX + this.config.margin + this.shiftX, startY + this.config.margin + this.shiftY).
            attr({opacity: op }).
            fill(gradient).
            transform({ rotate : rotate})
        } else {
            // @ts-ignore
            canvas.rect(height, width).fill(gradient).move(startX + this.config.margin + this.shiftX, startY + this.config.margin + this.shiftY);
        }
    }

    private drawCircle(centerX: number, centerY: number, canvas: object, gradient: string , radiusX: number, radiusY?: number, isMask?: boolean) {
        const op = isMask ? 0.6 : 1;
        if(gradient.length > 7 ){
            // @ts-ignore
            gradient = canvas.gradient( 'linear',function(add){
                add.stop(0 , gradient.split(" ")[0])
                add.stop(1 , gradient.split(" ")[1])
            })
        } 
        let rotate = 0;
        if(this.config.gradientType === GradientType.VERTICAL){
            rotate = 90;
        }
        if (this.config.useOpacity) {

            // @ts-ignore
            // canvas.path(`M 0, 0
            // a ${radiusX},${radiusX} 0 1 1 ${radiusX * 2},0
            // a ${radiusX},${radiusX} 0 1 1 -${radiusX * 2},0`)
            canvas.circle().radius(radiusX)
            .fill(gradient).move(centerX + this.config.margin - radiusX + this.shiftX, centerY + this.config.margin - radiusX + this.shiftY).attr({opacity: op});
        } else {
            // @ts-ignore
            // canvas.path(`M 0, 0
            // a ${radiusX},${radiusX} 0 1 1 ${radiusX * 2},0
            // a ${radiusX},${radiusX} 0 1 1 -${radiusX * 2},0`)
            canvas.circle().radius(radiusX)
            .fill(gradient).move(centerX + this.config.margin - radiusX + this.shiftX, centerY + this.config.margin - radiusX + this.shiftY);
        }
    }

    private drawKite(startX: number, startY: number, context: object, gradient: string, width: number, height: number, isRound?: boolean, isMask?: boolean) {
        const op = isMask ? 0.6 : 1;
        if(gradient.length > 7 ){
            // @ts-ignore
            gradient = context.gradient( 'linear',function(add){
                add.stop(0 , gradient.split(" ")[0])
                add.stop(1 , gradient.split(" ")[1])
            })
        } 
        let rotate = 0;
        if(this.config.gradientType === GradientType.VERTICAL){
            rotate = 90;
        }
        const coordinates = [[startX + width / 2 + this.config.margin + this.shiftX, startY + this.config.margin + this.shiftY],
            [startX + width + this.config.margin + this.shiftX, startY + height / 2 + this.config.margin + this.shiftY],
            [startX + width / 2 + this.config.margin + this.shiftX, startY + height + this.config.margin + this.shiftY],
            [startX + this.config.margin + this.shiftX, startY + height / 2 + this.config.margin + this.shiftY]];
        // @ts-ignore
        const polygon = context.polygon(coordinates);
        // M 50 0 100 100 50 200 0 100 Z
        if (this.config.useOpacity) {
            polygon.fill(gradient).attr({opacity: op});
        } else {
            polygon.fill(gradient);
        }
    }


    private drawDiamond(startX: number, startY: number, context: object, gradient: string , width: number, height: number, isRight?: boolean, isMask?: boolean) {
        const op = isMask ? 0.6 : 1;
        if(gradient.length > 7 ){
            // @ts-ignore
            gradient = context.gradient( 'linear',function(add){
                add.stop(0 , gradient.split(" ")[0])
                add.stop(1 , gradient.split(" ")[1])
            })
        } 
        let rotate = 0;
        if(this.config.gradientType === GradientType.VERTICAL){
            rotate = 90;
        }
        const d = width/2;
        if (isRight) {
            if (this.config.useOpacity) {
                // @ts-ignore
                context.path(`M${d*2} ${d}h${d}v${d}l-${d} ${d}H${d}v-${d}`)
                    .fill(gradient).move(startX + this.config.margin + this.shiftX, startY + this.config.margin + this.shiftY).attr({opacity: op});
            } else {
                // @ts-ignore
                context.path(`M${d*2} ${d}h${d}v${d}l-${d} ${d}H${d}v-${d}`)
                    .fill(gradient).move(startX + this.config.margin + this.shiftX, startY + this.config.margin + this.shiftY);
            }
        } else {
            if (this.config.useOpacity) {
                // @ts-ignore
                context.path(`M0 0h${d}l${d} ${d}v${d}h-${d}l-${d}-${d}`)
                    .fill(gradient).move(startX + this.config.margin + this.shiftX, startY + this.config.margin + this.shiftY).attr({opacity: op});
            } else {
                // @ts-ignore
                context.path(`M0 0h${d}l${d} ${d}v${d}h-${d}l-${d}-${d}`)
                    .fill(gradient).move(startX + this.config.margin + this.shiftX, startY + this.config.margin + this.shiftY);
            }
        }
    }

    drawThinSquare(startX: number, startY: number, canvas: object, gradient: string, width: number, height: number, isRound?: boolean, isMask?: boolean){
        this.drawSquare(startX, startY, canvas, width, height, true, gradient , isMask )
    }

    private async drawFocus(startX: number, startY: number, canvas: object, gradient: string | undefined, width: number, height: number) {
        /* Change Implementation : 
            Make one big rect with background color
            Draw the corner lines 
            Add image from Top 
        */
        const moduleSize = this.config.moduleSize;
        let backgroundColor = this.config.backgroundColor ? this.config.backgroundColor : '#ffffff';
        const radius = moduleSize;
        let frameWidth = moduleSize * 2 / 3; 

        if(backgroundColor === 'rgba(255,255,255,0)'){
            backgroundColor = '#ffffff00'
        }

        // @ts-ignore
        canvas.rect(width , height).move(startX , startY).fill(backgroundColor);

        //TOP LEFT FOCUS 
        // @ts-ignore
        canvas.polyline([   startX + frameWidth / 2 , startY  + frameWidth / 2 + height / 3,
                            startX + frameWidth / 2, startY  + frameWidth / 2, 
                            startX + frameWidth / 2 + width / 3, startY  + frameWidth / 2
                        ]).stroke({ 
                            color : gradient ,
                            width : frameWidth ,
                            linejoin : 'round' 
                        });

        //TOP RIGHT FOCUS 
        // @ts-ignore
        canvas.polyline([   startX + frameWidth / 2 + width * 2 / 3  , startY  + frameWidth / 2 ,
                            startX + width - frameWidth / 2  , startY  + frameWidth / 2,
                            startX - frameWidth / 2 + width , startY  + frameWidth / 2 + height / 3
                        ]).stroke({ 
                            color : gradient ,
                            width : frameWidth ,
                            linejoin : 'round' 
                        });

        //BOTTOM RIGHT FOCUS 
        // @ts-ignore
        canvas.polyline([   startX - frameWidth / 2 + width , startY  + frameWidth / 2 + height * 2 / 3  ,
                            startX + width - frameWidth / 2  , startY + height - frameWidth / 2,
                            startX - frameWidth / 2 + width * 2 / 3 , startY  - frameWidth / 2 +  height
                        ]).stroke({ 
                            color : gradient ,
                            width : frameWidth ,
                            linejoin : 'round' 
                        });
        

        //BOTTOM LEFT FOCUS 
        // @ts-ignore
        canvas.polyline([   startX + frameWidth / 2  , startY  + frameWidth / 2 + height * 2 / 3  ,
                            startX + frameWidth / 2  , startY + height - frameWidth / 2,
                            startX - frameWidth / 2 + width / 3 , startY  - frameWidth / 2 +  height
                        ]).stroke({ 
                            color : gradient ,
                            width : frameWidth ,
                            linejoin : 'round' 
                        }); 
    }

    private async drawTextOnlyBackground(startX: number, startY: number, canvas: object, gradient: string | undefined, width: number, height: number) {
        const moduleSize = this.config.moduleSize;
        const backgroundColor = this.config.backgroundColor ? this.config.backgroundColor : '#ffffff';
        const radius = moduleSize;
        // @ts-ignore
        canvas.rect(width, height).fill(backgroundColor).move(startX, startY);
        // @ts-ignore
        canvas.rect(width - 2 * moduleSize, height - 2 * moduleSize).fill(backgroundColor).move(startX + moduleSize, startY + moduleSize);
    }

    private async drawSquareFrame(startX: number, startY: number, canvas: object, gradient: string | undefined, width: number, height: number) {

        const moduleSize = this.config.moduleSize;
        let frameWidth = moduleSize * 2 / 3; 
         // @ts-ignore
        canvas.polyline([   startX + frameWidth / 2, startY  + frameWidth / 2, 
                            startX + width - frameWidth / 2 , startY  + frameWidth / 2, 
                            startX + width - frameWidth / 2, startY + height - frameWidth / 2, 
                            startX + frameWidth / 2, startY + height - frameWidth / 2, 
                            startX + frameWidth / 2 , startY + frameWidth / 2])
                        .stroke({ 
                            color : gradient ,
                            width : frameWidth ,
                            linejoin : 'round' ,
                            linecap : 'round'
                        })
        

        // @ts-ignore
        // canvas.rect(width, height).fill(gradient ? gradient : '#000000').radius(radius).move(startX, startY);
        // @ts-ignore
        // canvas.rect(width - 2 * moduleSize, height - 2 * moduleSize).fill(backgroundColor).radius(radius).move(startX + moduleSize, startY + moduleSize);
    }

    private async drawFrame(canvas: object, frameStyle: QRCodeFrame | undefined, frameColor: string | undefined, frameText: string | undefined) {
        if (!frameStyle || frameStyle === QRCodeFrame.NONE || frameStyle === QRCodeFrame.CIRCULAR) {
            return;
        }
        
        

        const color = frameColor ? frameColor : '#000000';
        const textColor = this.config.frameTextColor || '#ffffff';
        const moduleSize = this.config.moduleSize;
        const rawSize = this.config.size;
        let size = rawSize + moduleSize * 2;
        const text = frameText || 'SCAN ME';
        const fontSize = getFrameTextSize(this.config.viewportSize, text.length);
        let borderX = 0, borderY = 0, bannerX = 0, bannerY = 0,
            textX = 0, textY = 0, logoX = 0, logoY = 0, cornerRadius = 0;

        if (isNode) {
            const path = require('path');
            const fontPath = path.join(__dirname, '../src/assets/fonts/Roboto');
            // const {setFontDir, setFontFamilyMappings, preloadFonts} = require('svgdom');
            // setFontDir(fontPath);
            // setFontFamilyMappings({'Roboto': 'Roboto-Regular.ttf'});
            // preloadFonts();
        }


        switch (frameStyle) {
            case QRCodeFrame.BANNER_BOTTOM:
                cornerRadius = moduleSize;
                borderX = moduleSize / 2;
                borderY = moduleSize / 2;
                bannerX = moduleSize / 2;
                bannerY = size + moduleSize / 2 - 1;
                textX = size / 3;
                textY =  ( 2 * bannerY + ( size / 5 )) / 2 + fontSize / 7;
                logoX = size / 3 - size / 9;
                logoY = size + moduleSize * 1.5;
                break;
            case QRCodeFrame.BANNER_TOP:
                borderX = moduleSize / 2;
                borderY = moduleSize / 2 + size / 5 - 1;
                bannerX = moduleSize / 2;
                bannerY = moduleSize / 2;
                textX = size / 3;
                textY =   ( 2 * bannerY + ( size / 5 )) / 2 + fontSize / 7;
                logoX = size / 3 - size / 9;
                logoY = moduleSize * 2;
                break;
            case QRCodeFrame.BOX_BOTTOM:
                borderX = moduleSize / 2;
                borderY = moduleSize / 2;
                bannerX = moduleSize / 2;
                bannerY = size + moduleSize * 1.5;
                textX = size / 3;
                textY =   ( 2 * bannerY + ( size / 5 )) / 2 + fontSize / 7;
                logoX = size / 3 - size / 9;
                logoY = size + moduleSize * 3;
                break;
            case QRCodeFrame.BOX_TOP:
                borderX = moduleSize / 2;
                borderY = moduleSize * 1.5 + size / 5;
                bannerX = moduleSize / 2;
                bannerY = moduleSize / 2;
                textX = size / 3;
                textY =  ( 2 * bannerY + ( size / 5 )) / 2 + fontSize / 7;
                logoX = size / 3 - size / 9;
                logoY = moduleSize * 2;
                break;
            case QRCodeFrame.BALLOON_BOTTOM:
                borderX = moduleSize / 2;
                borderY = moduleSize / 2;
                bannerX = moduleSize / 2;
                bannerY = size + moduleSize * 1.5;
                textX = size / 3;
                textY =   ( 2 * bannerY + ( size / 5 )) / 2 + fontSize / 7;
                logoX = size / 3 - size / 9;
                logoY = size + moduleSize * 4;
                break;
            case QRCodeFrame.BALLOON_TOP:
                borderX = moduleSize / 2;
                borderY = moduleSize * 1.5 + size / 5;
                bannerX = moduleSize / 2;
                bannerY = moduleSize / 2;
                textX = size / 3;
                textY =   ( 2 * bannerY + ( size / 5 )) / 2 + fontSize / 7;
                logoX = size / 3 - size / 9;
                logoY = this.config.isVCard ? moduleSize * 3 : moduleSize * 2;
                //this.shiftY = 0.9 * this.shiftY
                break;
            case QRCodeFrame.TEXT_ONLY:
                borderX = moduleSize / 2;
                borderY = moduleSize / 2;
                bannerX = moduleSize / 2;
                bannerY = size + moduleSize * 1.5;
                textX = size / 3;
                textY =   ( 2 * bannerY + ( size / 5 )) / 2 + fontSize / 7;
                logoX = size / 3 - size / 9;
                logoY = size + moduleSize * 3;
                break;
            case QRCodeFrame.FOCUS:
                borderX = moduleSize / 2;
                borderY = moduleSize / 2;
                bannerX = moduleSize / 2;
                bannerY = size + moduleSize * 1.5;
                textX = size / 3;
                textY =   ( 2 * bannerY + ( size / 5 )) / 2 + fontSize / 7;
                logoX = size / 3 - size / 9;
                logoY = size + moduleSize * 3;
                break;
            default:
                break;
        }

        if (frameStyle !== QRCodeFrame.BALLOON_TOP && frameStyle !== QRCodeFrame.BALLOON_BOTTOM
            && frameStyle !== QRCodeFrame.TEXT_ONLY && frameStyle !== QRCodeFrame.FOCUS) {
            this.drawSquareFrame(borderX, borderY, canvas, color, size, size);
        }

        if (frameStyle === QRCodeFrame.TEXT_ONLY) {
            this.drawTextOnlyBackground(borderX, borderY, canvas, color, size, size)
        }

        if (frameStyle === QRCodeFrame.FOCUS) {
            this.drawFocus(borderX, borderY, canvas, color, size, size)
        }

        if (frameStyle === QRCodeFrame.BALLOON_BOTTOM) {
            const coordinates = [[0, 0], [size / 24, size / 12], [-size / 24, size / 12]];
            // @ts-ignore
            canvas.polygon(coordinates).fill(color).move(size / 2 - moduleSize, size - moduleSize / 2);
        }
        if (frameStyle === QRCodeFrame.BALLOON_TOP) {
            const coordinates = [[0, 0], [size / 24, 0], [0, size / 12], [-size / 24, 0]];
            // @ts-ignore
            canvas.polygon(coordinates).fill(color).move(size / 2 - size/24 + moduleSize / 2, size / 5 - moduleSize / 2);
        }

        // Banner for frame text
        if (frameStyle !== QRCodeFrame.TEXT_ONLY && frameStyle !== QRCodeFrame.FOCUS) {
            // @ts-ignore
            canvas.rect(size, size / 5).fill(color).radius(moduleSize)
            .move(bannerX, bannerY);
        }

        if (frameStyle === QRCodeFrame.BANNER_BOTTOM) {
            // @ts-ignore
            canvas.rect(moduleSize, moduleSize* 4/3 ).fill(color)
                .move(bannerX, bannerY - moduleSize / 3);

            // @ts-ignore
            canvas.rect(moduleSize, moduleSize * 4/3).fill(color)
                .move(size - moduleSize / 2, bannerY - moduleSize / 3);
        }
        if (frameStyle === QRCodeFrame.BANNER_TOP) {
            // @ts-ignore
            canvas.rect(moduleSize, moduleSize * 4/3).fill(color)
                .move(bannerX, bannerY - moduleSize + size / 5);

            // @ts-ignore
            canvas.rect(moduleSize, moduleSize * 4/3).fill(color)
                .move(size - moduleSize / 2, bannerY - moduleSize + size / 5);
        }
        // @ts-ignore
        canvas.defs().style(`
            @import url('https://fonts.googleapis.com/css?family=Roboto:400');
    `);
              
        // @ts-ignore
        textX = canvas.width()/2;
    


        // @ts-ignore
        canvas.plain(text).move(textX, textY)
            .font({ fill: textColor, family: 'Roboto', size: fontSize, leading: 0, anchor: 'middle'});

        if (this.config.isVCard) {
            // @ts-ignore
            logoX = (canvas.width()/2 - canvas.node.childNodes[canvas.node.childNodes.length - 1].getComputedTextLength()/2) - (this.config.size/13);
            logoY = logoY + (moduleSize * 3.2)
        } else {
            // @ts-ignore
            logoX = (canvas.width()/2 - canvas.node.childNodes[canvas.node.childNodes.length - 1].getComputedTextLength()/2) - (this.config.size/12);
            logoY = logoY + (moduleSize * 0.3)
        }

        return canvas;
    }


    getGradientColor(color1: number[], color2: number[], weight: any) {
        var w1 = weight;
        var w2 = 1 - w1;
        var rgb = [Math.round(color1[0] * w1 + color2[0] * w2),
            Math.round(color1[1] * w1 + color2[1] * w2),
            Math.round(color1[2] * w1 + color2[2] * w2)];
        return rgb;
    }

    hexToRgb(hex : string) {
        //@ts-ignore
        return hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i
             ,(m, r, g, b) => '#' + r + r + g + g + b + b)
    .substring(1).match(/.{2}/g)
    .map(x => parseInt(x, 16))
    }

    async setLogoDimensions(){
        let result = await probe(this.config.logoImage);
        this.config.logoHeight = result.height;
        this.config.logoWidth = result.width ;
        this.config.rectangular = this.config.logoWidth !== this.config.logoHeight;
    }


    isDataDotBehindLogo( dataDotLeftPosition : number, dataDotTopPosition :number ) {

        let dotLength ;
        
        if(this.config.dotScale > 0 && this.config.dotScale <= 1)
            dotLength = this.config.moduleSize * this.config.dotScale ;
        else   
            dotLength = this.config.moduleSize ;      

        const logoXPosition = this.logoAreaCordinateX - this.config.margin ;
        const logoYPosition = this.logoAreaCordinateY - this.config.margin ;

        const logoXLength = this.calculatedLogoAreaWidth ;
        const logoYLength = this.calculatedLogoAreaHeight ;
        const dotXPosition = dataDotLeftPosition + this.shiftX;
        const dotYPosition = dataDotTopPosition + this.shiftY ;

        if( dotXPosition >= logoXPosition && 
            dotXPosition <= logoXPosition + logoXLength && 
            dotYPosition >= logoYPosition && 
            dotYPosition <= logoYPosition + logoYLength)
            return true;

        if( dotXPosition + dotLength >= logoXPosition && 
            dotXPosition + dotLength <= logoXPosition + logoXLength && 
            dotYPosition >= logoYPosition && 
            dotYPosition <= logoYPosition + logoYLength)
            return true;
        
        if( dotXPosition >= logoXPosition && 
            dotXPosition <= logoXPosition + logoXLength && 
            dotYPosition + dotLength >= logoYPosition && 
            dotYPosition + dotLength <= logoYPosition + logoYLength)
            return true;

        if( dotXPosition + dotLength >= logoXPosition && 
            dotXPosition + dotLength <= logoXPosition + logoXLength && 
            dotYPosition + dotLength >= logoYPosition && 
            dotYPosition + dotLength <= logoYPosition + logoYLength)
            return true;
    
        return false ;
        
    }   


    calculateLogoDimensions(){

        let logoHeight , logoWidth , logoAreaWidth , logoAreaHeight;

        let logoScale = this.config.logoScale ;
        let logoMargin = this.config.logoMargin ;
        let rectangular = this.config.rectangular ;
        
        if (logoScale <= 0 || logoScale >= 1) {
            logoScale = 0.2 ;
        }
        if( logoMargin < 0 || logoMargin > 100 ){
            logoMargin = 50 ;
        }

        // Calibrating logo margin to avoid small logos ( This will ensure atleast 50% area of logo is covered by the actual logo)
        logoMargin = 0.5 * logoMargin 

        if(!this.config.logoHeight || !this.config.logoWidth ){
            logoHeight = this.config.size ;
            logoWidth = this.config.size ;
            rectangular = false ;
        } else {
            logoHeight = this.config.logoHeight;
            logoWidth = this.config.logoWidth;
        }

        // Calculate max area for logo
        if( rectangular ){

            let logoAreaMaxSide = maxLogoScale * this.config.size ;

            if( logoHeight > logoWidth ){
                let ratio = logoWidth / logoHeight ;
                logoAreaHeight = logoAreaMaxSide;
                logoAreaWidth = logoAreaHeight * ratio ;
            } else {
                let ratio = logoHeight / logoWidth ;
                logoAreaWidth = logoAreaMaxSide ;
                logoAreaHeight = logoAreaWidth * ratio ;
            }

            logoAreaHeight = ( logoScale / maxLogoScale ) * logoAreaHeight ;
            logoAreaWidth = ( logoScale / maxLogoScale ) * logoAreaWidth ;
            this.calculatedLogoAreaHeight = logoAreaHeight ;
            this.calculatedLogoAreaWidth = logoAreaWidth ;

        } else {
            
            let logoAreaMaxSide = maxLogoScale * this.config.size ;
            logoAreaHeight = logoAreaMaxSide  * ( logoScale / maxLogoScale) ;
            logoAreaWidth = logoAreaMaxSide * ( logoScale / maxLogoScale) ;
            this.calculatedLogoAreaHeight = logoAreaMaxSide  * ( logoScale / maxLogoScale) ;
            this.calculatedLogoAreaWidth = logoAreaMaxSide * ( logoScale / maxLogoScale) ;

        }

        logoHeight = ( ( 100 - logoMargin) / 100 ) * logoAreaHeight ;
        logoWidth = ( ( 100 - logoMargin) / 100 ) * logoAreaWidth ;

        this.calculatedLogoWidth = logoWidth ;
        this.calculatedLogoHeight = logoHeight ;
        this.logoCordinateX = this.shiftX + 0.5 * (this.config.size - logoWidth);
        this.logoCordinateY = this.shiftY + 0.5 * (this.config.size - logoHeight);  
        this.logoAreaCordinateX = this.shiftX + 0.5 * ( this.config.size - logoAreaWidth )
        this.logoAreaCordinateY = this.shiftY + 0.5 * ( this.config.size - logoAreaHeight );
    }


    create2DArrayOfDots(moduleCount: number, xyOffset:number) {
        let TwoDArrayOfDataDots: Array<Array<boolean>> = []
            for (let row = 0; row < moduleCount; row++) {
                TwoDArrayOfDataDots[row] = []
                for (let col = 0; col < moduleCount; col++) { 
                    const drawDataDot = this.isDark.bind(this)(row, col) || false;

                    const isBlkPosCtr = (col < 8 && (row < 8 || row >= moduleCount - 8)) || (col >= moduleCount - 8 && row < 8);
                    let bProtected = isBlkPosCtr || !drawDataDot;

                    const nLeft = col * this.config.nSize + (bProtected ? 0 : xyOffset * this.config.nSize);
                    const nTop = row * this.config.nSize + (bProtected ? 0 : xyOffset * this.config.nSize);

                    let _isDataDotBehindLogo = false;
                    if( this.config.logoBackground && this.config.logoImage ){
                        _isDataDotBehindLogo = this.isDataDotBehindLogo(nLeft , nTop );
                    }
                    bProtected = bProtected || _isDataDotBehindLogo;
                    TwoDArrayOfDataDots[row][col] = !bProtected;
                }
            }
        this.TwoDArray = TwoDArrayOfDataDots;
    }
      
}



