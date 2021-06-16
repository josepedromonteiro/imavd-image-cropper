import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';


declare var webkitSpeechRecognition: any;

@Injectable({
  providedIn: 'root'
})
export class SpeechRecognitionService {

  public activeLanguage: string;
  public isRecording: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public recognition = new webkitSpeechRecognition();
  public isStoppedSpeechRecog = false;
  public text: BehaviorSubject<string> = new BehaviorSubject('');
  private tempWords;

  constructor() {
    this.init();
  }

  init(): void {

    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    this.recognition.continuous = true;

    this.recognition.addEventListener('result', (e) => {
      const transcript = Array.from(e.results)
        .map((result: SpeechRecognitionResult) => result[0])
        .map((result: SpeechRecognitionAlternative) => result.transcript)
        .join('');
      this.tempWords = transcript;
      this.text.next(this.tempWords);
    });
  }

  start(lang: string = 'en-US'): void {
    this.isStoppedSpeechRecog = false;
    this.recognition.lang = this.activeLanguage || lang;
    this.recognition.start();
    this.recognition.addEventListener('end', (condition) => {
      if (this.isStoppedSpeechRecog) {
        this.recognition.stop();
      } else {
        this.recognition.start();
      }
    });

    this.isRecording.next(true);
  }

  stop(): void {
    this.isStoppedSpeechRecog = true;
    this.recognition.stop();
    this.isRecording.next(false);
  }

}
