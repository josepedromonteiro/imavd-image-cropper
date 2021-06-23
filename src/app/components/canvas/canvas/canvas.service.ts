import {Injectable} from '@angular/core';
import {fabric} from 'fabric';
import {BehaviorSubject, Subject} from 'rxjs';
import {CANVAS_ACTIONS, CanvasActionService} from './canvas-actions.service';

interface ImageCoordinatesSize {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface RGBA {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export interface Color {
  colorString: string;
  colorArray: RGBA;
}

export interface ColorClick {
  color: Color;
  numberOfPixels: number;
}

export interface CMenuItem {
  icon?: string;
  label: string;
  onClick: () => void;
}

const DEFAULT_COLOR: Color = {
  colorString: '#000',
  colorArray: {
    r: 0,
    g: 0,
    b: 0
  }
};

interface ImageOptions {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

const RIGHT_PADDING = 350;

interface CanvasObjects {
  squares: fabric.Rect[];
  circle: fabric.Circle[];
  triangles: fabric.Triangle[];
  images: fabric.Image[];
}


export enum TTS_OBJECTS {
  SQUARE,
  CIRCLE,
  TRIANGLE,
  IMAGE,
  ALL
}

export enum TTS_ACTIONS {
  ROTATE_RIGHT,
  ROTATE_LEFT,
  GROW,
  REDUCE,
  DUPLICATE,
  TRANSLATE_HORIZONTAL,
  TRANSLATE_VERTICAL,
  ABORT_ANIMATIONS,
  GRAYSCALE,
  COLOR,
  ADD,
  QUAD,
  DUAL,
  TOP_LEFT,
  BOTTOM_RIGHT
}


@Injectable({
  providedIn: 'root'
})
export class CanvasService {
  set canvas(canvas: fabric.Canvas) {
    if (canvas) {
      this._canvas = canvas;
      this.onCanvasReady.next(this.canvas);
      this.enablePanAndZoom();
    }
  }

  get canvas(): fabric.Canvas {
    return this._canvas;
  }

  private _canvas: fabric.Canvas;
  public onMouseMoveColor: BehaviorSubject<Color> = new BehaviorSubject<Color>(DEFAULT_COLOR);
  public onClickColor: Subject<ColorClick> = new Subject<ColorClick>();
  public items: CMenuItem[] = [];
  public cutElement: fabric.Rect;
  public mainImage: fabric.Image;
  public onCanvasReady: Subject<fabric.Canvas> = new Subject();
  public canvasObjects: CanvasObjects = {
    squares: [],
    circle: [],
    triangles: [],
    images: []
  };

  public stopAnimations = false;

  constructor(private canvasAction: CanvasActionService) {
    this.items = [
      {
        icon: 'crop',
        label: 'Crop',
        onClick: () => {
          this.activateCrop();
        }
      }
    ];
  }

  public addImageToCanvas(imageUrl: string, options?: ImageOptions): void {

    fabric.Image.fromURL(imageUrl, (myImg): void => {

      // const newWidth =  this.canvas.width * .9;
      // const newHeight =  this.canvas.height * .9;
      // const widthFactor = myImg.getScaledWidth() / newWidth;
      // const heightFactor = myImg.getScaledHeight() / newHeight;
      // const minFactor = Math.min(widthFactor, heightFactor);
      // myImg.scale(minFactor);

      this.mainImage = myImg;
      this.redifyImage();
      this.greenfyImage();
      this.bluefyImage();
      this.canvas?.add(this.mainImage);
      this.centerObject(this.mainImage);
      this.canvas?.setActiveObject(this.mainImage);

      this.canvasObjects.images.push(myImg);

      this.canvas.contextCache.drawImage(
        this.mainImage._element,
        options?.x || 0,
        options?.y || 0,
        options?.width || this.canvas?.getWidth(),
        options?.height || this.canvas?.getHeight());
    });
  }

  private enablePanAndZoom(): void {
    this.canvas.on('mouse:down', function (opt) {
      const evt = opt.e;
      if (evt.ctrlKey === true || evt.metaKey === true) {
        evt.preventDefault();
        this.isDragging = true;
        this.selection = false;
        this.lastPosX = evt.clientX;
        this.lastPosY = evt.clientY;
      }
    });

    this.canvas.on('mouse:move', (opt) => {
      this.colorMouseMove(opt);
    });

    this.canvas.on('mouse:up', (opt) => {
      this.colorClick();
    });

    this.canvas.on('mouse:move', function (opt) {
      if (this.isDragging) {
        const e = opt.e;
        const vpt = this.viewportTransform;
        vpt[4] += e.clientX - this.lastPosX;
        vpt[5] += e.clientY - this.lastPosY;
        this.requestRenderAll();
        this.lastPosX = e.clientX;
        this.lastPosY = e.clientY;
      }
    });
    this.canvas.on('mouse:up', function (opt) {
      // on mouse up we want to recalculate new interaction
      // for all objects, so we call setViewportTransform
      this.setViewportTransform(this.viewportTransform);
      this.isDragging = false;
      this.selection = true;
    });

    this.canvas.on('mouse:wheel', opt => {
      const delta: any = opt.e.deltaY;
      let zoom = this.canvas.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 20) {
        zoom = 20;
      }
      if (zoom < 0.1) {
        zoom = 0.1;
      }
      this.canvas.zoomToPoint({x: opt.e.offsetX, y: opt.e.offsetY}, zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });
  }

  public redifyImage(): void {
    fabric.Image.filters.Redify = fabric.util.createClass(fabric.Image.filters.BaseFilter, {

      type: 'Redify',

      /**
       * Fragment source for the redify program
       */
      fragmentSource: 'precision highp float;\n' +
        'uniform sampler2D uTexture;\n' +
        'varying vec2 vTexCoord;\n' +
        'void main() {\n' +
        'vec4 color = texture2D(uTexture, vTexCoord);\n' +
        'color.g = 0.0;\n' +
        'color.b = 0.0;\n' +
        'gl_FragColor = color;\n' +
        '}',

      applyTo2d: options => {
        const imageData = options.imageData;
        const data = imageData.data;
        const len = data.length;

        for (let i = 0; i < len; i += 4) {
          data[i + 1] = 0;
          data[i + 2] = 0;
        }

      }
    });

    fabric.Image.filters.Redify.fromObject = fabric.Image.filters.BaseFilter.fromObject;
  }


  public bluefyImage(): void {
    fabric.Image.filters.Bluefy = fabric.util.createClass(fabric.Image.filters.BaseFilter, {

      type: 'Bluefy',

      /**
       * Fragment source for the redify program
       */
      fragmentSource: 'precision highp float;\n' +
        'uniform sampler2D uTexture;\n' +
        'varying vec2 vTexCoord;\n' +
        'void main() {\n' +
        'vec4 color = texture2D(uTexture, vTexCoord);\n' +
        'color.g = 0.0;\n' +
        'color.r = 0.0;\n' +
        'gl_FragColor = color;\n' +
        '}',

      applyTo2d: options => {
        const imageData = options.imageData;
        const data = imageData.data;
        const len = data.length;

        for (let i = 0; i < len; i += 4) {
          data[i] = 0;
          data[i + 1] = 0;
        }

      }
    });

    fabric.Image.filters.Bluefy.fromObject = fabric.Image.filters.BaseFilter.fromObject;
  }

  public greenfyImage(): void {
    fabric.Image.filters.Greenfy = fabric.util.createClass(fabric.Image.filters.BaseFilter, {

      type: 'Greenfy',

      /**
       * Fragment source for the redify program
       */
      fragmentSource: 'precision highp float;\n' +
        'uniform sampler2D uTexture;\n' +
        'varying vec2 vTexCoord;\n' +
        'void main() {\n' +
        'vec4 color = texture2D(uTexture, vTexCoord);\n' +
        'color.r = 0.0;\n' +
        'color.b = 0.0;\n' +
        'gl_FragColor = color;\n' +
        '}',

      applyTo2d: options => {
        const imageData = options.imageData;
        const data = imageData.data;
        const len = data.length;

        for (let i = 0; i < len; i += 4) {
          data[i] = 0;
          data[i + 2] = 0;
        }

      }
    });

    fabric.Image.filters.Greenfy.fromObject = fabric.Image.filters.BaseFilter.fromObject;
  }

  public colorMouseMove(e): void {
    const x: number = e.offsetX || e.layerX || e.pointer.x;
    const y: number = e.offsetY || e.layerY || e.pointer.y;
    const pointColor = this.canvas.getContext('2d').getImageData(x, y, 1, 1).data;
    const colorString = `rgba(${pointColor[0]},${pointColor[1]},${pointColor[2]},${pointColor[3]})`;
    const colorArray: RGBA = {
      r: pointColor[0],
      g: pointColor[1],
      b: pointColor[2],
      a: pointColor[4]
    };
    this.onMouseMoveColor.next({
      colorString,
      colorArray
    });
  }

  public colorClick(): void {
    this.onClickColor.next({
      color: this.onMouseMoveColor.getValue(),
      numberOfPixels: this.calculateNumberOfPixels(this.onMouseMoveColor.getValue().colorArray)
    });
  }

  public activateCrop(): void {
    const activeElement = /**this.canvas.getActiveObject() ||**/ this.canvas;
    const cropDimensions = {
      height: activeElement.height * .5,
      width: activeElement.width * .5
    };
    this.cutElement = new fabric.Rect({
      left: (activeElement?.left || 0) + (activeElement.width - 350) / 2 - (cropDimensions.width / 2),
      top: (activeElement?.top || 0) + activeElement.height / 2 - (cropDimensions.height / 2),
      fill: 'transparent',
      originX: 'left',
      originY: 'top',
      stroke: 'rgba(17,122,34,1)',
      strokeDashArray: [4, 5],
      strokeUniform: true,
      opacity: 1,
      width: cropDimensions.width,
      height: cropDimensions.height
    });
    console.log(this.canvas);
    this.canvas.add(this.cutElement);
    this.canvas.setActiveObject(this.cutElement);
    this.canvasAction.addAction(CANVAS_ACTIONS.CUTTING);
  }

  public cropObject(): void {

    const transform: number[] = this.canvas.viewportTransform.slice();
    this.cutElement.set('stroke', 'transparent');
    this.canvas.viewportTransform = [1, 0, 0, 1, 0, 0];
    const image = this.canvas.toDataURL({
      left: this.cutElement.left,
      top: this.cutElement.top,
      width: this.cutElement.getScaledWidth(),
      height: this.cutElement.getScaledHeight(),
      format: 'png'
    });
    this.canvas.viewportTransform = transform;

    this.addImageToCanvas(image);

    this.canvas.remove(this.cutElement);
    this.canvas.renderAll();


    this.canvas?.remove(...this.canvas.getObjects().filter((obj) => obj !== image));
  }


  // this.canvasService.mainImage.filters = [];

  public setRedifyFilter(activate: boolean): void {
    this.checkFilters();
    this.mainImage.filters[0] = activate ? new fabric.Image.filters.Redify() : null;
    this.applyFilters();
  }

  public setBluefyFilter(activate: boolean): void {
    this.checkFilters();
    this.mainImage.filters[5] = activate ? new fabric.Image.filters.Bluefy() : null;
    this.applyFilters();
  }

  public setGreenfyFilter(activate: boolean): void {
    this.checkFilters();
    this.mainImage.filters[6] = activate ? new fabric.Image.filters.Greenfy() : null;
    this.applyFilters();
  }

  public setSepiaFilter(activate: boolean): void {
    this.checkFilters();
    this.mainImage.filters[1] = activate ? new fabric.Image.filters.Sepia() : null;
    this.applyFilters();
  }

  public setGrayScaleFilter(activate: boolean, image: fabric.Image = this.mainImage): void {
    this.checkFilters(image);
    image.filters[9] = activate ? new fabric.Image.filters.Grayscale() : null;
    this.applyFilters(image);
  }

  public setInvert(activate: boolean): void {
    this.checkFilters();
    this.mainImage.filters[7] = activate ? new fabric.Image.filters.Invert() : null;
    this.applyFilters();
  }

  public setBrightness(value: number): void {
    this.checkFilters();
    this.mainImage.filters[2] = new fabric.Image.filters.Brightness({
      brightness: value || 0
    });
    this.applyFilters();
  }

  public setContrast(value: number): void {
    this.checkFilters();
    this.mainImage.filters[3] = new fabric.Image.filters.Contrast({
      contrast: value || 0
    });
    this.applyFilters();
  }

  public setGamma(value: number): void {
    this.mainImage.filters[4] = new fabric.Image.filters.Gamma({
      gamma: [value, value, value] || [1, 1, 1]
    });
    this.applyFilters();
  }

  public setBackgroundColor(color: string, intensity: number): void {
    this.mainImage.filters[8] = new fabric.Image.filters.RemoveColor({
      distance: intensity / 100 || 0,
      color: color || '#ffffff'
    });
    this.applyFilters();
  }

  public flipVertically(value: boolean): void {
    this.mainImage.set('flipY', value);
    this.canvas.renderAll();
  }

  public flipHorizontally(value: boolean): void {
    this.mainImage.set('flipX', value);
    this.canvas.renderAll();
  }

  public addTextToCanvas(text: string = 'Add your text here', color: string = '#333') {
    const textbox = new fabric.Textbox(text, {
      fontFamily: 'arial',
      fill: color,
      fontSize: 30,
      width: text.length * 20
    });

    this.canvas.add(textbox);
    this.centerObject(textbox);
    this.canvas.renderAll();
  }

  public addCircleToCanvas(color: string = getRandomColor()) {
    const circle = new fabric.Circle({
      radius: 50,
      fill: color,
      height: 100,
      width: 100
    });

    circle.type = 'circle';

    this.canvas.add(circle);
    this.centerObject(circle);
    this.canvas.renderAll();
    this.canvasObjects.circle.push(circle);
  }

  public addSquareToCanvas(color: string = getRandomColor()) {
    const square = new fabric.Rect({
      fill: color,
      height: 100,
      width: 100
    });

    square.type = 'square';
    this.canvas.add(square);
    this.centerObject(square);
    this.canvas.renderAll();
    this.canvasObjects.squares.push(square);
  }

  public addTriangleToCanvas(color: string = getRandomColor()) {
    const triangle = new fabric.Triangle({
      width: 100,
      height: 100,
      fill: color
    });

    triangle.type = 'triangle';
    this.canvas.add(triangle);
    this.centerObject(triangle);
    this.canvas.renderAll();
    this.canvasObjects.triangles.push(triangle);
  }

  public executeActionInObject(obj: TTS_OBJECTS, action: TTS_ACTIONS, color: string = '#ff0000'): void {
    let objs: fabric.Object[] = [];

    switch (obj) {
      case TTS_OBJECTS.SQUARE:
        objs = this.canvasObjects.squares.filter(obj_ => obj_);
        break;
      case TTS_OBJECTS.CIRCLE:
        objs = this.canvasObjects.circle.filter(obj_ => obj_);
        break;
      case TTS_OBJECTS.TRIANGLE:
        objs = this.canvasObjects.triangles.filter(obj_ => obj_);
        break;
      case TTS_OBJECTS.IMAGE:
        objs = this.canvasObjects.images.filter(obj_ => obj_);
        break;
      case TTS_OBJECTS.ALL:
        objs = [...this.canvasObjects.images.filter(obj_ => obj_),
          ...this.canvasObjects.triangles.filter(obj_ => obj_),
          ...this.canvasObjects.circle.filter(obj_ => obj_),
          ...this.canvasObjects.squares.filter(obj_ => obj_)];
        break;
      default:
        break;
    }

    switch (action) {
      case TTS_ACTIONS.QUAD:
        objs.forEach((iObj: fabric.Object) => {
          this.quadCanvas(iObj);
        });
        break;
      case TTS_ACTIONS.DUAL:
        objs.forEach((iObj: fabric.Object) => {
          this.dualCanvas(iObj);
        });
        break;
      case TTS_ACTIONS.TOP_LEFT:
        objs.forEach((iObj: fabric.Object) => {
          this.alignTopLeft(iObj);
        });
        break;
      case TTS_ACTIONS.BOTTOM_RIGHT:
        objs.forEach((iObj: fabric.Object) => {
          this.alignBottomRight(iObj);
        });
        break;
      case TTS_ACTIONS.ROTATE_RIGHT:
        objs.forEach((iObj: fabric.Object) => {
          this.animateRotate(iObj);
        });
        break;
      case TTS_ACTIONS.ROTATE_LEFT:
        objs.forEach((iObj: fabric.Object) => {
          this.animateRotate(iObj, -360);
        });
        break;
      case TTS_ACTIONS.GROW:
        objs.forEach((iObj: fabric.Object) => {
          this.animateScale(iObj);
        });
        break;
      case TTS_ACTIONS.REDUCE:
        objs.forEach((iObj: fabric.Object) => {
          this.animateScale(iObj, 1, .5);
        });
        break;
      case TTS_ACTIONS.DUPLICATE:
        objs.forEach((iObj: fabric.Object) => {
          const duplicatedObj = fabric.util.object.clone(iObj);
          duplicatedObj.set('top', iObj.top);
          duplicatedObj.set('left', iObj.left + iObj.width + 10);
          switch (obj) {
            case TTS_OBJECTS.SQUARE:
              this.canvasObjects.squares.push(duplicatedObj);
              break;
            case TTS_OBJECTS.CIRCLE:
              this.canvasObjects.circle.push(duplicatedObj);
              break;
            case TTS_OBJECTS.TRIANGLE:
              this.canvasObjects.triangles.push(duplicatedObj);
              break;
          }
          this.canvas.add(duplicatedObj);
        });
        this.canvas.renderAll();
        break;
      case TTS_ACTIONS.TRANSLATE_HORIZONTAL:
        objs.forEach((iObj: fabric.Object) => {
          this.animateTranslate(iObj);
        });
        break;
      case TTS_ACTIONS.TRANSLATE_VERTICAL:
        objs.forEach((iObj: fabric.Object) => {
          this.animateTranslate(iObj, 'top');
        });
        break;
      case TTS_ACTIONS.ABORT_ANIMATIONS:
        this.stopAnimations = true;
        setTimeout(() => {
          this.stopAnimations = false;
        }, 3000);
        break;
      case TTS_ACTIONS.GRAYSCALE:
        objs.forEach((iObj: fabric.Object) => {
          this.setGrayScaleFilter(true, iObj);
        });
        break;
      case TTS_ACTIONS.COLOR:
        // Red, blue, green, yellow, orange and purple
        objs.forEach((iObj: fabric.Object) => {
          iObj.set('fill', color);
          this.canvas.renderAll();
        });
        break;
      case TTS_ACTIONS.ADD:
        switch (obj) {
          case TTS_OBJECTS.SQUARE:
            this.addSquareToCanvas();
            break;
          case TTS_OBJECTS.CIRCLE:
            this.addCircleToCanvas();
            break;
          case TTS_OBJECTS.TRIANGLE:
            this.addTriangleToCanvas();
            break;
        }
    }
  }

  public multiplyHorizontally(times: number = 1): void {
    const activeObject = this.canvas.getActiveObject();
    console.log(activeObject);
    const items: fabric.Object[] = activeObject._objects ? activeObject._objects : [activeObject];
    items.forEach((item: fabric.Object) => {
      for (let step = 0; step < times; step++) {
        const clonedObject = fabric.util.object.clone(item);
        this.canvas.add(clonedObject);
        this.addObjectToArray(clonedObject);
        clonedObject.set('left', activeObject.left + (activeObject.width + 10) * (step + 1));
      }
    });
    this.canvas.requestRenderAll();
  }

  public multiplyVertically(times: number = 1): void {
    const activeObject = this.canvas.getActiveObject();
    const items: fabric.Object[] = activeObject._objects ? activeObject._objects : [activeObject];

    items.forEach((item: fabric.Object) => {
      for (let step = 0; step < times; step++) {
        const clonedObject = fabric.util.object.clone(item);
        this.canvas.add(clonedObject);
        this.addObjectToArray(clonedObject);
        clonedObject.set('top', activeObject.top + (activeObject.height + 10) * (step + 1));
      }
    });
    this.canvas.requestRenderAll();
  }


  public async quadCanvas(object?: fabric.Object): Promise<void> {
    if (!object) {
      this.groupSelected();
    }
    const placeholderObject = object || this.canvas.getActiveObject();
    const activeObject = object || await this.getImageFromObject(this.canvas.getActiveObject());
    if (activeObject) {

      const objectTopLeft = fabric.util.object.clone(activeObject);
      this.alignObject('top', objectTopLeft);
      this.alignObject('left', objectTopLeft);

      const objectTopRight = fabric.util.object.clone(activeObject);
      this.alignObject('top', objectTopRight);
      this.alignObject('right', objectTopRight);


      const objectBottomRight = fabric.util.object.clone(activeObject);
      this.alignObject('right', objectBottomRight);
      this.alignObject('bottom', objectBottomRight);


      const objectBottomLeft = fabric.util.object.clone(activeObject);
      this.alignObject('bottom', objectBottomLeft);
      this.alignObject('left', objectBottomLeft);

      this.canvas.add(objectTopLeft);
      this.canvas.add(objectBottomLeft);
      this.canvas.add(objectBottomRight);
      this.canvas.add(objectTopRight);
      this.canvasObjects.images.push(...[objectTopLeft, objectBottomLeft, objectBottomRight, objectTopRight]);
      this.canvas.remove(placeholderObject);

      this.canvas.requestRenderAll();
    }

  }

  private addObjectToArray(object: fabric.Object): void {
    switch (object.type) {
      case 'triangle':
        this.canvasObjects.triangles.push(object);
        break;
        break;
      case 'square':
        this.canvasObjects.squares.push(object);
        break;
        break;
      case 'circle':
        this.canvasObjects.circle.push(object);
        break;
      case 'image':
        this.canvasObjects.images.push(object);
        break;
    }
  }

  public async dualCanvas(object?: fabric.Object): Promise<void> {
    if (!object) {
      this.groupSelected();
    }
    const placeholderObject = object || this.canvas.getActiveObject();
    const activeObject = object || await this.getImageFromObject(this.canvas.getActiveObject());
    if (activeObject) {

      const objectTop = fabric.util.object.clone(activeObject);
      objectTop.set('left', placeholderObject.left);
      objectTop.set('top', this.canvas.height / 4 - (objectTop.height * objectTop.scaleY) / 2);


      const objectBottom = fabric.util.object.clone(activeObject);
      objectBottom.set('left', placeholderObject.left);
      objectBottom.set('top', (3 * this.canvas.height) / 4 - (objectBottom.height * objectBottom.scaleY) / 2);

      this.canvas.add(objectTop);
      this.canvas.add(objectBottom);
      this.canvasObjects.images.push(...[objectTop, objectBottom]);

      this.canvas.remove(placeholderObject);

      this.canvas.requestRenderAll();
    }
  }

  public async alignTopLeft(object?: fabric.Object): Promise<void> {
    if (!object) {
      this.groupSelected();
    }
    const placeholderObject = object || this.canvas.getActiveObject();
    const activeObject = object || this.canvas.getActiveObject();
    if (activeObject) {

      const objectTopLeft = fabric.util.object.clone(activeObject);
      this.alignObject('top', objectTopLeft);
      this.alignObject('left', objectTopLeft);
      this.canvas.add(objectTopLeft);

      this.ungroup(objectTopLeft);
      // this.canvasObjects.images.push(objectTopLeft);
      this.canvas.remove(placeholderObject);

      this.canvas.requestRenderAll();
    }
  }

  public async alignBottomRight(object?: fabric.Object): Promise<void> {
    if (!object) {
      this.groupSelected();
    }
    const placeholderObject = object || this.canvas.getActiveObject();
    const activeObject = object || this.canvas.getActiveObject();
    if (activeObject) {
      const objectBottomRight = fabric.util.object.clone(activeObject);
      console.log(objectBottomRight);
      this.alignObject('bottom', objectBottomRight);
      this.alignObject('right', objectBottomRight);
      this.canvas.add(objectBottomRight);
      this.ungroup(objectBottomRight);
      // this.canvasObjects.images.push(objectBottomRight);
      this.canvas.remove(placeholderObject);

      this.canvas.requestRenderAll();
    }
  }

  public getImageFromObject(object: fabric.Object): Promise<any> {
    return new Promise((resolve, _) => {
      return new fabric.Image.fromURL(object.toDataURL(), (image) => {
        return resolve(image);
      });
    });
  }

  public alignObject(val: 'left' | 'top' | 'right' | 'bottom' | 'center', object: fabric.Object, padding = 20) {
    switch (val) {
      case 'left':
        object.set('left', padding);
        break;
      case 'right':
        object.set('left',
          this.canvas.width - (object.width * object.scaleX) - 350 - padding // 350 - sidebar width
        );
        break;
      case 'top':
        object.set('top', padding);
        break;
      case 'bottom':
        object.set('top', this.canvas.height - (object.height * object.scaleY) - 110 - padding) //  110 - dock
        break;
      case 'center':
        console.log(object.width);
        object.set('left', (this.canvas.width / 2) - ((object.width * object.scaleX) * 2)
        );
        break;
    }
  }

  public groupSelected(): void {
    if (!this.canvas.getActiveObject()) {
      return;
    }
    if (this.canvas.getActiveObject().type !== 'activeSelection') {
      return;
    }
    this.canvas.getActiveObject().toGroup();
    this.canvas.requestRenderAll();
  }

  public ungroup(group?: fabric.Object): void {
    const obj = group || this.canvas.getActiveObject();
    if (obj?.type !== 'group') {
      return;
    }

    obj._objects.forEach((unit) => {
      if (unit?.type === 'group') {
        this.ungroup(unit);
      } else {
        this.addObjectToArray(unit);
      }
    });
    obj.toActiveSelection();
    this.canvas.requestRenderAll();
  }

  private animateScale(iObj: fabric.Object, from = 1, to = 2): void {
    iObj.animate({
        scaleX: to,
        scaleY: to,
        originX: 'center',
        originY: 'center',
      },
      {
        easing: fabric.util.ease.easeOutCubic,
        duration: 3000,
        onChange: () => this.canvas.renderAll(),
        onComplete: () => {
          if (this.stopAnimations) {
            iObj.scaleX = 1;
            iObj.scaleY = 1;
            this.canvas.renderAll();
            return;
          }
          this.animateScale(iObj, to, from);
        },
        abort: () => this.stopAnimations
      });
  }

  private animateTranslate(iObj: fabric.Object, property: 'top' | 'left' = 'left', distance: number = 400, initialPosition?: number): void {
    const initialPropertyDistance: number = iObj[property];
    if (!initialPosition) {
      initialPosition = initialPropertyDistance;
    }
    iObj.animate({
        [property]: initialPropertyDistance + distance,
        originX: 'center',
        originY: 'center',
      },
      {
        easing: fabric.util.ease.easeOutCubic,
        duration: 3000,
        onChange: () => this.canvas.renderAll(),
        onComplete: () => {
          if (this.stopAnimations) {
            iObj[property] = initialPosition;
            this.canvas.renderAll();
            return;
          }
          this.animateTranslate(iObj, property,
            iObj[property] === initialPropertyDistance + distance ? -distance : distance,
            initialPosition);
        },
        abort: () => this.stopAnimations
      });
  }

  private animateRotate(iObj: fabric.Object, angle = 360): void {
    iObj.animate({
        angle,
        originX: 'center',
        originY: 'center',
      },
      {
        easing: fabric.util.ease.easeOutCubic,
        duration: 3000,
        onChange: () => this.canvas.renderAll(),
        onComplete: () => {
          iObj.angle = 0;
          if (this.stopAnimations) {
            this.canvas.renderAll();
            return;
          }
          this.animateRotate(iObj, angle);
        },
        abort: () => this.stopAnimations
      });
  }

  private checkFilters(image: fabric.Image = this.mainImage): void {
    if (!image?.filters) {
      // [redify, sepia, brightness, contrast, gamma,bluefy, greenfy, invert, removecolor, grayscale]
      image.filters = [];
    }
  }

  private applyFilters(image: fabric.Image = this.mainImage): void {
    image.applyFilters();
    this.canvas.renderAll();
  }

  private calculateNumberOfPixels(color: RGBA): number {
    if (!this.canvas) {
      return;
    }

    let nPixels = 0;

    const imageData = this.canvas
      .getContext('2d')
      .getImageData(0, 0, this.canvas.getWidth(), this.canvas.getHeight());

    for (let index = 0; index < imageData.data.length; index += 4) {
      const rgb = [
        imageData.data[index],
        imageData.data[index + 1],
        imageData.data[index + 2],
      ];
      if (
        rgb[0] === color.r &&
        rgb[1] === color.g &&
        rgb[2] === color.b
      ) {
        nPixels++;
      }
    }
    return nPixels;
  }

  private centerObject(object: any): void {
    this.canvas.centerObject(object);
    object.set('left', object.left - RIGHT_PADDING / 2);
  }
}

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
