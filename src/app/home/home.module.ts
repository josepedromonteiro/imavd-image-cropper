import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import { CardItemComponent } from '../components/card-item/card-item.component';

import { ImageCropperModule } from 'ngx-image-cropper';
import { CanvasModule } from '../components/canvas/canvas.module';
import { ExpandableCardModule } from '../components/expandable-card/expandable-card.module';
import {ImageTtsComponent} from '../components/image-tts/image-tts.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    CanvasModule,
    ExpandableCardModule
  ],
    declarations: [HomePage, CardItemComponent, ImageTtsComponent]
})
export class HomePageModule {}
