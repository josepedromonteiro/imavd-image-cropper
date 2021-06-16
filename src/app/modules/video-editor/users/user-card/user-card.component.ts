import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {User} from "../service/users.service";

@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UserCardComponent implements OnInit {

  @Input() user: User;

  constructor() {
  }

  ngOnInit() {
  }

}
