import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {DockComponent} from "./dock.component";
import {RouterModule} from "@angular/router";



@NgModule({
  declarations: [
    DockComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [DockComponent]
})
export class DockModule { }
