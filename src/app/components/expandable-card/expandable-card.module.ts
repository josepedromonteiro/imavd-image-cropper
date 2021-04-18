import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpandableCardComponent } from './expandable-card.component';
import { IonicModule } from '@ionic/angular';


@NgModule({
  declarations: [ExpandableCardComponent],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [ExpandableCardComponent]
})
export class ExpandableCardModule {
}
