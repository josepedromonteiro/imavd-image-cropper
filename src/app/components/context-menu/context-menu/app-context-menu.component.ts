import {
  AfterViewInit,
  Component,
  ElementRef,
  HostBinding,
  HostListener,
  Input,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { CanvasService } from '../../canvas/canvas/canvas.service';
import { CONTEXT_ANIMATION } from './context-menu.animations';
import { ContextMenuItemDirective } from 'ngx-contextmenu/lib/contextMenu.item.directive';
import { ContextMenuContentComponent } from 'ngx-contextmenu/lib/contextMenuContent.component';

interface ContextMenuOption {
  icon?: string;
  label?: string;
}

@Component({
  selector: 'app-context-menu',
  templateUrl: './app-context-menu.component.html',
  styleUrls: ['./app-context-menu.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [CONTEXT_ANIMATION]
})
export class AppContextMenuComponent implements OnInit {

  @HostBinding('@contextAnimation') public animation = true;

  @Input() public options: ContextMenuOption[] = [];
  @HostListener('document:click', ['$event'])
  public clickDocument(event) {
    if (this.elementRef.nativeElement.contains(event.target)) {
      // this.text = "clicked inside";
    } else {
      // this.text = "clicked outside";
      this.elementRef.nativeElement.remove();
    }
  }

  constructor(private elementRef: ElementRef, private canvasService: CanvasService) {
    this.options = [{
      icon: 'crop',
      label: 'Crop'
    }];
  }

  ngOnInit() {
  }

  public open(event?: MouseEvent): void {
    event.preventDefault();
    // this.canvasService.canvas.
    this.elementRef.nativeElement.style.top = `${event.clientY + 10}px`;
    this.elementRef.nativeElement.style.left = `${event.clientX + 10}px`;
    console.log(this.elementRef.nativeElement.style);
  }

}
