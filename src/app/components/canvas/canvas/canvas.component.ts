import {
  AfterContentInit,
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  NgZone,
  Output,
  Self,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { fabric } from 'fabric';
import { CanvasService } from './canvas.service';
import { ContextMenuComponent } from 'ngx-contextmenu';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CanvasComponent implements AfterViewInit, AfterContentInit {
  @ViewChild('imageElement') public imageElement: ElementRef<HTMLImageElement>;
  @ViewChild('canvasElement')
  public canvasElement: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasContainer')
  public canvasContainer: ElementRef<HTMLCanvasElement>;
  public fabricCanvas: fabric.Canvas;

  @Input() public pickColorActive = false;
  public pixelCount = 0;
  public pickedColorElements: {
    r: number;
    g: number;
    b: number;
  } = {
    r: 0,
    g: 0,
    b: 0,
  };
  // public imageUrl =
  //   'https://image.freepik.com/fotos-gratis/vista-vertical-na-torre-eiffel-paris-franca_1258-3169.jpg';
  // public imageUrl = '';
  @Input() public imageUrl = 'assets/shapes.svg';

  @Input() showCropper = false;
  @Input() imageChangedEvent: any = '';
  @Output() nPixels = new EventEmitter<number>();
  @Output() onImageLoadEvent = new EventEmitter<any>();

  public contextMenuChild: ElementRef<ContextMenuComponent>;

  constructor(private canvasService: CanvasService,
              @Self() private elementRef: ElementRef,
              private ngZone: NgZone) {
  }


  @HostListener('window:resize', ['$event'])
  public onWindowResize(): void {
    this.setCanvasDimensions();
  }


  @HostListener('document:keyup', ['$event'])
  handleDeleteKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Delete') {
      this.canvasService?.canvas?.remove(this.canvasService?.canvas?.getActiveObject());
    }
  }


  ngAfterContentInit(): void {
  }

  ngAfterViewInit(): void {

    setTimeout(() => {
      this.fabricCanvas = new fabric.Canvas('fabric-canvas', {
        backgroundColor: 'rgba(0,0,0,0)',
        selection: false,
        preserveObjectStacking: true,
      });

      this.canvasService.canvas = this.fabricCanvas;
      this.setCanvasDimensions();
      this.fabricCanvas.renderAll();
    }, 500);

  }

  onImageLoad(evt: any) {
    if (!evt) {
      return;
    }

    setTimeout(() => {
      this.useCanvas(
        this.canvasElement.nativeElement,
        this.imageElement.nativeElement
      );
    }, 1000);

    this.onImageLoadEvent.emit(evt);
  }

  clickColor(evt: any) {
    this.pickColorActive = false;
    this.pixelCount = this.calculateNumberOfPixels();
    this.nPixels.emit(this.pixelCount);
  }

  useCanvas(canvas: HTMLCanvasElement, image: HTMLImageElement): void {
    if (!canvas || !image) {
      return;
    }

    const boundings = this.imageElement?.nativeElement?.getBoundingClientRect();
    canvas.width = boundings.width;
    canvas.height = boundings.height;

    const newimage = new Image();
    newimage.src = image.src;
    newimage.crossOrigin = 'anonymous';

    this.canvasService.addImageToCanvas(newimage.src);
    // enablePanzoom(this.canvasService.canvas, newimage);
  }

  private calculateNumberOfPixels(): number {
    if (!this.canvasElement?.nativeElement) {
      return;
    }

    let npixels = 0;

    const canvasElem = this.canvasElement.nativeElement;

    const imageData = this.canvasElement.nativeElement
      .getContext('2d')
      .getImageData(0, 0, canvasElem.width, canvasElem.height);

    for (let index = 0; index < imageData.data.length; index += 4) {
      const rgb = [
        imageData.data[index],
        imageData.data[index + 1],
        imageData.data[index + 2],
      ];
      if (
        rgb[0] === this.pickedColorElements.r &&
        rgb[1] === this.pickedColorElements.g &&
        rgb[2] === this.pickedColorElements.b
      ) {
        npixels++;
      }
    }
    return npixels;
  }

  private setCanvasDimensions(): void {
    this.canvasService.canvas.setDimensions({
      width: this.canvasContainer?.nativeElement?.offsetWidth || 1000,
      height: this.canvasContainer?.nativeElement?.offsetHeight || 1000,
    });
  }

  imageCropped(event: ImageCroppedEvent) {
    this.imageUrl = event.base64;
  }

  saveImage() {
    const a = document.createElement('a');
    a.href = this.imageUrl;
    a.download = 'image.png';

    a.click();
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
