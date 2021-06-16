import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {Track} from 'ngx-audio-player';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-import-audio',
  templateUrl: './import-audio.component.html',
  styleUrls: ['./import-audio.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ImportAudioComponent implements OnInit {

  audioPlaylist: Track[] = [];

  constructor(private sanitizer: DomSanitizer) {
  }

  ngOnInit(): void {
  }

  playAudio(event: any): void {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.audioPlaylist.push({
        title: file.name,
        link: this.sanitizer.bypassSecurityTrustResourceUrl(reader.result as string) as string
      });
    };
  }
}
