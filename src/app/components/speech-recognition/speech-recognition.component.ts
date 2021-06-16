import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {SpeechRecognitionService} from '../../services/speech-recognition/speech-recognition.service';
import {LanguageService} from '../../services/languages/language.service';
import {SpeakService} from '../../services/speak/speak.service';

@Component({
  selector: 'app-speech-recognition',
  templateUrl: './speech-recognition.component.html',
  styleUrls: ['./speech-recognition.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SpeechRecognitionComponent implements OnInit {

  constructor(public speechService: SpeechRecognitionService,
              public languageService: LanguageService,
              private speakService: SpeakService) {
  }

  ngOnInit(): void {
    this.speechService.activeLanguage = this.languageService.langs[0].code;
  }

  toggle(): void {
    if (this.speechService.isRecording.getValue()) {
      this.speechService.stop();
    } else {
      this.speechService.start();
    }

  }

  clearText(): void {
    this.speechService.text.next('');
  }

  speak(): void {
    this.speakService.speech.setLanguage(this.speechService.activeLanguage);
    this.speakService.speech.speak({
      text: this.speechService.text.getValue(),
      queue: false
    });
  }
}
