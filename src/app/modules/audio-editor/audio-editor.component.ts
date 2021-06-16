import {AfterViewInit, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {LanguageService} from '../../services/languages/language.service';
import {SpeakService} from '../../services/speak/speak.service';
import {DockService} from "../dock/dock.service";

@Component({
  selector: 'app-audio-editor',
  templateUrl: './audio-editor.component.html',
  styleUrls: ['./audio-editor.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AudioEditorComponent implements OnInit {


  public audioSource: string;
  public activeLanguage: string;
  public text: string;

  constructor(public languageService: LanguageService,
              public speakService: SpeakService,
              private dockService: DockService) {
  }


  ionViewWillEnter(): void {
    this.dockService.removeSideBar();
  }

  ngOnInit() {
    this.activeLanguage = this.languageService.langs[0].code;
  }


  playAudio(): void {
    const audio = new Audio(this.audioSource);
    audio.load();
    audio.play();
  }

  selectAudioFile(event: any): void {
    this.audioSource = event.target.files[0].src;
    console.log(event.target.files);
    this.playAudio();
  }

  public textToSpeech(): void {
    this.speakService.speech.setLanguage(this.activeLanguage);
    this.speakService.speech.speak({
      text: this.text,
      queue: false
    });
  }

}
