import { Injectable } from '@angular/core';
import Speech from 'speak-tts';

@Injectable({
  providedIn: 'root'
})
export class SpeakService {


  public speech: Speech;

  constructor() {
    this.speech = new Speech();
    this.speech.init({
      volume: 1,
      lang: 'en-GB',
      rate: 1,
      pitch: 1,
      splitSentences: true,
      listeners: {
        onvoiceschanged: (voices) => {
          // console.log('Event voiceschanged', voices);
        }
      }
    });

    if (this.speech.hasBrowserSupport()) {
      console.log('speech synthesis supported');
    }
  }
}
