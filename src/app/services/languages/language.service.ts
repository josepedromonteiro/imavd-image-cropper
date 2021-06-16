import {Injectable} from '@angular/core';


export interface Lang {
  code: string;
  name: string;
}


@Injectable({
  providedIn: 'root'
})
export class LanguageService {


  public langs: Lang[] = [];

  constructor() {
    this.langs = [
      {
        name: 'Português',
        code: 'pt-PT'
      },
      {
        name: 'English',
        code: 'en-GB'
      }
    ];
  }
}
