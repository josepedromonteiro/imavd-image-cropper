import {AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {LanguageService} from '../../services/languages/language.service';
import {SpeakService} from '../../services/speak/speak.service';
import {DockService} from '../dock/dock.service';
import {SpeechRecognitionService} from '../../services/speech-recognition/speech-recognition.service';

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


  public left = ``;
  public right = ``;

  // @ViewChild('diff') diffComponent: NgxTextDiffComponent;

  constructor(public languageService: LanguageService,
              public speakService: SpeakService,
              public speechService: SpeechRecognitionService,
              private dockService: DockService) {
  }


  ionViewWillEnter(): void {
    this.dockService.removeSideBar();
  }

  ngOnInit() {
    this.activeLanguage = this.languageService.langs[0].code;

    this.speechService.text.subscribe((val) => {
      this.right = val;
      // this.diffComponent?.renderDiffs();
    });
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


  // public onCompareResults(diffResults: DiffResults) {
  //   // console.log('diffResults', diffResults);
  // }

  onTextChange(val: string) {
    this.text = val;
    this.left = val;
    // this.diffComponent?.renderDiffs();
  }
}
