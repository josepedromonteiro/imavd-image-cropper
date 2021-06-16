import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {VideoEditorComponent} from './video-editor/video-editor.component';
import {IonicModule} from '@ionic/angular';
import {RouterModule, Routes} from '@angular/router';
import {UsersComponent} from './users/users.component';
import {CKEditorModule} from '@ckeditor/ckeditor5-angular';
import {FormsModule} from '@angular/forms';
import {UserExpandableCardComponent} from './users/components/expandable-card/expandable-card.component';
import {UserCardComponent} from "./users/user-card/user-card.component";


const routes: Routes = [
  {
    path: '',
    component: VideoEditorComponent
  }
];

@NgModule({
  declarations: [VideoEditorComponent, UsersComponent, UserExpandableCardComponent, UserCardComponent],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(routes),
    CKEditorModule,
    FormsModule
  ],
  exports: [VideoEditorComponent]
})
export class VideoEditorModule { }
