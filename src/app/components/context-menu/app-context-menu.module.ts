import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppContextMenuComponent } from './context-menu/app-context-menu.component';
import { ContextMenuModule } from 'ngx-contextmenu';



@NgModule({
  declarations: [AppContextMenuComponent],
  imports: [
    CommonModule,
    ContextMenuModule
  ],
  exports: [AppContextMenuComponent]
})
export class AppContextMenuModule { }
