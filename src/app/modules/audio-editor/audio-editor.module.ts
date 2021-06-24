import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {AudioEditorComponent} from './audio-editor.component';
import {RouterModule, Routes} from '@angular/router';
import {IonicModule} from '@ionic/angular';
import {SpeechRecognitionComponent} from '../../components/speech-recognition/speech-recognition.component';
import {FormsModule} from '@angular/forms';
import {ImportAudioComponent} from '../../components/import-audio/import-audio.component';
import {NgxAudioPlayerModule} from 'ngx-audio-player';
import {NgxTextDiffModule} from 'ngx-text-diff';


const routes: Routes = [
  {
    path: '',
    component: AudioEditorComponent
  }
];


@NgModule({
  declarations: [
    AudioEditorComponent,
    SpeechRecognitionComponent,
    ImportAudioComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    IonicModule,
    FormsModule,
    NgxAudioPlayerModule,
    NgxTextDiffModule
  ],
  exports: [AudioEditorComponent, SpeechRecognitionComponent]
})
export class AudioEditorModule { }
