import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {VideoEditorComponent} from './video-editor/video-editor.component';
import {IonicModule} from '@ionic/angular';
import {RouterModule, Routes} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {UserCardComponent} from './users/user-card/user-card.component';


const routes: Routes = [
  {
    path: '',
    component: VideoEditorComponent
  }
];

@NgModule({
  declarations: [VideoEditorComponent, UserCardComponent],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(routes),
    FormsModule
  ],
  exports: [VideoEditorComponent]
})
export class VideoEditorModule { }
