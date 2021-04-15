import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { CardItem } from '../components/card-item/card-item.component';
import { enablePanzoom } from './panzoom';

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

  public pickColorActive = false;
  public pixelCount = 0;
  public pickedColor = 'rgba(0,0,0,0)';
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
  public imageUrl = 'assets/shapes.svg';
  public imageMetadata: CardItem[] = [];

  constructor(private changeRef: ChangeDetectorRef) {}
  ngAfterViewInit(): void {
    this.canvasElement.nativeElement.addEventListener(
      'mousemove',
       (evt) => {
        this.onMouseEnter(evt);
      },
      false
    );
  }

  processFile(imageInput: HTMLInputElement) {
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

    setTimeout(() => {
      this.useCanvas(
        this.canvasElement.nativeElement,
        this.imageElement.nativeElement
      );
    }, 1000);
  }

  clickColor(evt: any) {
    this.onMouseEnter(evt);
    this.pickColorActive = false;
    this.pixelCount = this.calculateNumberOfPixels();
  }

  onMouseEnter(e: any) {
    if (!this.pickColorActive) {
      return;
    }
    let x: number;
    let y: number;
    if (e.offsetX) {
      x = e.offsetX;
      y = e.offsetY;
    } else if (e.layerX) {
      x = e.layerX;
      y = e.layerY;
    }
    const pointColor = this.canvasElement.nativeElement
      .getContext('2d')
      .getImageData(x, y, 1, 1).data;
    this.pickedColor = `rgba(${pointColor[0]},${pointColor[1]},${pointColor[2]},${pointColor[3]})`;
    this.pickedColorElements = {
      r: pointColor[0],
      g: pointColor[1],
      b: pointColor[2],
    };
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

    enablePanzoom(this.canvasElement.nativeElement, newimage);
    // newimage.onload = () => {
    //   this.drawImage(canvas.getContext('2d'), newimage, canvas);
    // };
    // this.drawImage(canvas.getContext('2d'), newimage, canvas);
  }

  private drawImage(ctx, img, canvas) {
    const hRatio = canvas.width / img.width;
    const vRatio = canvas.height / img.height;
    const ratio = Math.min(hRatio, vRatio);

    // ctx.drawImage(img, canvas.width / 2 - img.width / 2, canvas.height / 2 - img.height / 2, img.width, img.height);

    const xPos =
      img.width > img.height ? 0 : canvas.width / 2 - (img.width * ratio) / 2;
    const yPos =
      img.height > img.width ? 0 : canvas.height / 2 - (img.height * ratio) / 2;
    ctx.drawImage(
      img,
      0,
      0,
      img.width,
      img.height,
      xPos,
      yPos,
      img.width * ratio,
      img.height * ratio
    );

    this.changeRef.detectChanges();
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
