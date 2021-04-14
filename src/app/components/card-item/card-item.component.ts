import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';

export interface CardItem{
  title: string;
  value: string;
}
@Component({
  selector: 'app-card-item',
  templateUrl: './card-item.component.html',
  styleUrls: ['./card-item.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CardItemComponent implements OnInit {

  @Input() item: CardItem = {
    title: '',
    value: ''
  };

  constructor() { }

  ngOnInit() {}

}
