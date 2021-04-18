import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { CONTENT_ANIMATION, TOGGLE_ANIMATION } from './expandable-card.animations';

export interface ExpandableCardData {
  label?: string;
}

@Component({
  selector: 'app-expandable-card',
  templateUrl: './expandable-card.component.html',
  styleUrls: ['./expandable-card.component.scss'],
  animations: [CONTENT_ANIMATION, TOGGLE_ANIMATION],
  encapsulation: ViewEncapsulation.None,
})
export class ExpandableCardComponent implements OnInit{

  @Input() title: string = '';
  public showContent: boolean = true;
  public startHeight: number = 0;
  @ViewChild('content') public content: ElementRef<HTMLDivElement>;

  constructor() {
  }

  ngOnInit() {
    this.startHeight = this.content?.nativeElement?.getBoundingClientRect()?.height;
  }

}
