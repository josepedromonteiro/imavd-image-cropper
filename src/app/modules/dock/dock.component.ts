import {AfterViewInit, Component, ElementRef, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';

interface Icon {
  routerLink: string;
  icon: string;
}

@Component({
  selector: 'app-dock',
  templateUrl: './dock.component.html',
  styleUrls: ['./dock.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DockComponent implements OnInit, AfterViewInit {

  @ViewChild('icons') icons: ElementRef;
  public areas: Icon[] = [];

  constructor() {
    this.areas = [
      {
        routerLink: 'image-editor',
        icon: 'assets/icon/image.png'
      },
      {
        routerLink: 'audio-editor',
        icon: 'assets/icon/music.png'
      },
      {
        routerLink: 'video-editor',
        icon: 'assets/icon/video.png'
      }
    ]
  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
  }
}
