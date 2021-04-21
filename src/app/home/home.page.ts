import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, ViewChild, ViewEncapsulation, } from '@angular/core';
import { CardItem } from '../components/card-item/card-item.component';
import { CanvasComponent } from '../components/canvas/canvas/canvas.component';
import { CanvasService, Color, ColorClick } from '../components/canvas/canvas/canvas.service';
import { throttleTime } from 'rxjs/operators';
import { CanvasActionService } from '../components/canvas/canvas/canvas-actions.service';

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
  // public imageUrl =
  //   'https://image.freepik.com/fotos-gratis/vista-vertical-na-torre-eiffel-paris-franca_1258-3169.jpg';
  // public imageUrl = '';
  public imageUrl = 'assets/shapes.svg';
  public imageMetadata: CardItem[] = [];

  showCropper = false;
  imageChangedEvent: any = '';

  constructor(private changeRef: ChangeDetectorRef,
              private canvasService: CanvasService,
              private canvasActions: CanvasActionService) {
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

  saveImage() {
    const imageDownload = this.canvasService.mainImage.toDataURL()

    const a = document.createElement('a')
    a.href = imageDownload
    a.download = 'image.jpg'

    a.click()
  }

  onPickedColor($event: Color) {
    this.pickedColor = $event;
    this.changeRef.markForCheck();
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
