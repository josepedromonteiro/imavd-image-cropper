import { Injectable } from '@angular/core';
import { fabric } from 'fabric';
import { BehaviorSubject, Subject } from 'rxjs';
import { CANVAS_ACTIONS, CanvasActionService } from './canvas-actions.service';

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

@Injectable({
  providedIn: 'root'
})
export class CanvasService {
  set canvas(canvas: fabric.Canvas) {
    if (canvas) {
      this._canvas = canvas;
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
      this.mainImage = myImg;
      this.redifyImage();
      this.canvas?.add(this.mainImage);
      this.centerObject(this.mainImage);
      this.canvas?.setActiveObject(this.mainImage);

      this.canvas.contextCache.drawImage(
        this.mainImage._element,
        options?.x || 0,
        options?.y || 0,
        options?.width || this.canvas?.getWidth(),
        options?.height || this.canvas?.getHeight());
    });
  }

  private enablePanAndZoom(): void {
    this.canvas.on('mouse:down', function(opt) {
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

    this.canvas.on('mouse:move', function(opt) {
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
    this.canvas.on('mouse:up', function(opt) {
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
      this.canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
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
    const activeElement = this.canvas.getActiveObject();
    if (!activeElement) {
      // Show warning theres no active element
      return;
    }
    const cropDimensions = {
      height: activeElement.height * .7,
      width: activeElement.width * .7
    };
    this.cutElement = new fabric.Rect({
      left: activeElement?.left + activeElement.width / 2 - (cropDimensions.width / 2),
      top: activeElement?.top + activeElement.height / 2 - (cropDimensions.height / 2),
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

    this.mainImage.selectable = true;
    this.canvas.setActiveObject(this.mainImage);
    this.canvas.remove(this.cutElement);
    this.canvas.renderAll();


    this.canvas?.remove(this.canvas.getObjects()[0]);
  }


  // [redify, sepia, brightness, contrast]
  // this.canvasService.mainImage.filters = [];

  public setRedifyFilter(activate: boolean): void {
    this.checkFilters();
    this.mainImage.filters[0] = activate ? new fabric.Image.filters.Redify() : null;
    this.applyFilters();
  }

  public setSepiaFilter(activate: boolean): void {
    this.checkFilters();
    this.mainImage.filters[1] = activate ? new fabric.Image.filters.Sepia() : null;
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
    console.log(value);
    this.checkFilters();
    this.mainImage.filters[4] = new fabric.Image.filters.Gamma({
      gamma: [value, value, value] || [1, 1, 1]
    });
    this.applyFilters();
  }

  private checkFilters(): void {
    if (!this.mainImage.filters) {
      this.mainImage.filters = [];
    }
  }

  private applyFilters(): void {
    this.mainImage.applyFilters();
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
