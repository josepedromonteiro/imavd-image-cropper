import { Component, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { CardItem } from '../components/card-item/card-item.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HomePage {

  @ViewChild('imageElement') public imageElement: ElementRef<HTMLImageElement>;
  @ViewChild('canvasElement') public canvasElement: ElementRef<HTMLCanvasElement>;

  public pickColorActive = false;
  public pixelCount = 0;
  public pickedColor = 'rgba(0,0,0,0)';
  public imageUrl = 'assets/shapes.svg';
  // public imageUrl = '';
  public imageMetadata: CardItem[] = [
  ];

  constructor() {
  }

  processFile(imageInput: HTMLInputElement) {
    console.log(imageInput.files);
    const file: File = imageInput.files[0];
    const reader = new FileReader();
    this.imageMetadata = [];

    reader.addEventListener('load', (event: any) => {
      this.imageUrl = event.target.result;
      this.imageMetadata = [
        {
          title: 'Name',
          value: file.name
        }, {
          title: 'Type',
          value: file.type
        }, {
          title: 'Date',
          value: new Date(file.lastModified).toUTCString()
        }, {
          title: 'Size',
          value: formatBytes(file.size)
        }
      ];

      if ((file as any).mozFullPath) {
        this.imageMetadata.push({
          title: 'Path',
          value: (file as any).mozFullPath
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
      value: `${width} x ${height} px`
    });
  }

  clickColor(evt: any){
    this.onMouseEnter(evt);
    this.pickColorActive = false;
  }

  onMouseEnter(e: any) {
    if(!this.pickColorActive){
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
    this.useCanvas(this.canvasElement.nativeElement, this.imageElement.nativeElement);
    const pointColor = this.canvasElement.nativeElement.getContext('2d').getImageData(x, y, 1, 1).data;
    this.pickedColor = `rgba(${pointColor[0]},${pointColor[1]},${pointColor[2]},${pointColor[3]})`;
    console.log(`x: ${x}, y: ${y}`);
    console.log(pointColor);
  }

  useCanvas(canvas: HTMLCanvasElement, image: HTMLImageElement): void {
    if (!canvas || !image) {
      return;
    }
    canvas.width = image.width;
    canvas.height = image.height;
    console.log(canvas);
    canvas.getContext('2d').drawImage(image, 0, 0, image.width, image.height);
  }
}

function formatBytes(a: number, b: number = 2) {
  if (0 === a) {
    return '0 Bytes';
  }
  const c = 0 > b ? 0 : b;
  const d = Math.floor(Math.log(a) / Math.log(1024));
  return parseFloat((a / Math.pow(1024, d)).toFixed(c)) + ' ' + ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'][d];
}
