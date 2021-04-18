import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CanvasComponent } from './canvas/canvas.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { ContextMenuModule } from 'ngx-contextmenu';
import { AppContextMenuModule } from '../context-menu/app-context-menu.module';
import { IonicModule } from '@ionic/angular';



@NgModule({
  declarations: [CanvasComponent],
  imports: [
    CommonModule,
    ImageCropperModule,
    AppContextMenuModule,
    ContextMenuModule,
    IonicModule
  ],
  exports: [CanvasComponent]
})
export class CanvasModule { }
