import {AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';

type State = 'collapsed' | 'expanded';

@Component({
  selector: 'app-user-expandable-card',
  templateUrl: './expandable-card.component.html',
  styleUrls: ['./expandable-card.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UserExpandableCardComponent implements OnInit, AfterViewInit {

  public state: State = 'collapsed';
  @Input() avatar: string;
  @Input() title: string;

  @ViewChild('content') public content: ElementRef<HTMLDivElement>;

  public maxHeight = 100;

  constructor() {
  }

  ngOnInit() {
  }

  toggle() {
    if (this.state === 'expanded') {
      this.state = 'collapsed';
    } else {
      this.state = 'expanded';
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      // this.maxHeight = this.content?.nativeElement?.getBoundingClientRect()?.height || 100;
      // console.log(this.content?.nativeElement?.getBoundingClientRect()?.height);
      // this.state = 'collapsed';
    });
  }
}
