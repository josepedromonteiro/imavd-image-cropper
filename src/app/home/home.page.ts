import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, ViewChild, ViewEncapsulation,} from '@angular/core';
import {CardItem} from '../components/card-item/card-item.component';
import {CanvasComponent} from '../components/canvas/canvas/canvas.component';
import {CanvasService, Color, ColorClick} from '../components/canvas/canvas/canvas.service';
import {throttleTime} from 'rxjs/operators';
import {CanvasActionService} from '../components/canvas/canvas/canvas-actions.service';
import {CanvasHistoryService} from "../components/canvas/canvas/canavas-history.service";
import {DockService} from "../modules/dock/dock.service";
import {BehaviorSubject} from "rxjs";

export type Tabs = 'general' | 'colors';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HomePage implements AfterViewInit {
  @ViewChild('imageElement') public imageElement: ElementRef<HTMLImageElement>;
  @ViewChild('imagePreview') public imagePreview: ElementRef<HTMLDivElement>;
  @ViewChild('canvasElement')
  public canvasElement: ElementRef<HTMLCanvasElement>;
  @ViewChild('appCanvas') public appCanvas: ElementRef<CanvasComponent>;

  public pickColorActive = false;
  public pixelCount = 0;
  public pickedColor: Color;
  public imageUrl;
  public imageMetadata: CardItem[] = [];
  public activeTab: Tabs = 'general';
  public isCropping: BehaviorSubject<boolean>;

  public multiplierX: string = '';
  public multiplierY: string = '';

  showCropper = false;
  imageChangedEvent: any = '';


  public variables: {
    remove_color?: {
      intensity?: number,
      color?: string;
    }
  } = {
    remove_color: {
      intensity: 0,
      color: '#ffffff'
    }
  };

  constructor(private changeRef: ChangeDetectorRef,
              public canvasService: CanvasService,
              public canvasActions: CanvasActionService,
              public canvasHistory: CanvasHistoryService,
              private dockService: DockService) {
    this.isCropping = new BehaviorSubject<boolean>(false);
    this.canvasService.onMouseMoveColor.pipe(
      throttleTime(100)
    ).subscribe((color: Color) => {
      if (!this.pickColorActive) {
        return;
      }
      this.canvasService.canvas.discardActiveObject().renderAll();
      this.pickedColor = color;
    });

    this.canvasService.onClickColor.pipe(
      throttleTime(100)
    ).subscribe((color: ColorClick) => {
      if (!this.pickColorActive) {
        return;
      }
      this.pickColorActive = false;
      this.pickedColor = color.color;
      this.pixelCount = color.numberOfPixels;
    });
  }

  ionViewWillEnter() {
    this.dockService.activateSideBar();
  }

  ngAfterViewInit(): void {
  }

  processFile(event: any, imageInput: HTMLInputElement) {
    const file: File = imageInput.files[0];
    const reader = new FileReader();
    this.imageMetadata = [];

    reader.addEventListener('load', (event: any) => {
      this.imageUrl = event.target.result;
      this.imageMetadata = [
        {
          title: 'Name',
          value: file.name,
        },
        {
          title: 'Type',
          value: file.type,
        },
        {
          title: 'Date',
          value: new Date(file.lastModified).toUTCString(),
        },
        {
          title: 'Size',
          value: formatBytes(file.size),
        },
      ];

      if ((file as any).mozFullPath) {
        this.imageMetadata.push({
          title: 'Path',
          value: (file as any).mozFullPath,
        });
      }
    });
    reader.readAsDataURL(file);

    this.imageChangedEvent = event;
  }

  onImageLoad(evt: any) {
    if (!evt) {
      return;
    }
    const width = evt.target.naturalWidth;
    const height = evt.target.naturalHeight;

    this.imageMetadata.push({
      title: 'Resolution',
      value: `${width} x ${height} px`,
    });
  }

  public changeTab(value: Tabs): void {
    this.activeTab = value;
  }

  async saveImage() {
    const dataURL = this.canvasService.canvas.toDataURL({
      format: 'png',
      multiplier: 2,
    });


    const blob = await fetch(dataURL).then(r => r.blob());
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'image.jpg';

    a.click();
    URL.revokeObjectURL(url);
    a.remove();
  }

  onPickedColor($event: Color) {
    this.pickedColor = $event;
    this.changeRef.markForCheck();
  }

  setSepiaFilter() {
    this.canvasService.setSepiaFilter(!this.canvasService?.mainImage?.filters[1]);
  }

  setInvertFilter() {
    this.canvasService.setInvert(!this.canvasService?.mainImage?.filters[7]);
  }

  setRedifyFilter() {
    this.canvasService.setRedifyFilter(!this.canvasService?.mainImage?.filters[0]);
  }

  setBluefyFilter() {
    this.canvasService.setBluefyFilter(!this.canvasService?.mainImage?.filters[5]);
  }

  setGreenfyFilter() {
    this.canvasService.setGreenfyFilter(!this.canvasService?.mainImage?.filters[6]);
  }

  setGrayScaleFilter() {
    this.canvasService.setGrayScaleFilter(!this.canvasService?.mainImage?.filters[9]);
  }

  setBrightness(value: Event): void {
    const brightness: number = (value as CustomEvent).detail.value / 255;
    this.canvasService.setBrightness(brightness);
  }

  setContrast(value: Event): void {
    const contrast: number = (value as CustomEvent).detail.value / 255;
    this.canvasService.setContrast(contrast);
  }

  setGamma(value: Event): void {
    const gamma: number = (value as CustomEvent).detail.value;
    this.canvasService.setGamma(gamma);
  }

  flipVertically(): void {
    this.canvasService.flipVertically(!this.canvasService.mainImage.flipY);
  }

  public flipHorizontally(): void {
    this.canvasService.flipHorizontally(!this.canvasService.mainImage.flipX);
  }

  public backgroundColorIntensityChange(): void {
    this.canvasService.setBackgroundColor(this.variables?.remove_color?.color, this.variables?.remove_color?.intensity);
  }

  public quadCanvas() {
    this.canvasService.quadCanvas();
  }

  public dualCanvas() {
    this.canvasService.dualCanvas();
  }

  public alignTopLeft() {
    this.canvasService.alignTopLeft();
  }

  public alignBottomRight() {
    this.canvasService.alignBottomRight();
  }

  public multiply(): void {
    if (this.multiplierX && Number(this.multiplierX) > 0) {
      this.canvasService.multiplyHorizontally(Number(this.multiplierX));
    }

    if (this.multiplierY && Number(this.multiplierY) > 0) {
      this.canvasService.multiplyVertically(Number(this.multiplierY));
    }

    this.multiplierX = '';
    this.multiplierY = '';
  }
}

function formatBytes(a: number, b: number = 2) {
  if (0 === a) {
    return '0 Bytes';
  }
  const c = 0 > b ? 0 : b;
  const d = Math.floor(Math.log(a) / Math.log(1024));
  return (
    parseFloat((a / Math.pow(1024, d)).toFixed(c)) +
    ' ' +
    ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'][d]
  );
}

export function sizeImageInCanvas(ctx, img, c, zoom) {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.drawImage(
    img,
    c.width / 2 - (img.width * zoom) / 2,
    c.height / 2 - (img.height * zoom) / 2,
    img.width * zoom,
    img.height * zoom
  );
}
