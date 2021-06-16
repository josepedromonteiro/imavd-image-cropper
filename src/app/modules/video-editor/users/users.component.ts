import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import {UsersService} from './service/users.service';

type Tabs = 'user' | 'manager';
@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UsersComponent implements OnInit {

  public Editor = ClassicEditor;

  public activeTab: Tabs = 'manager';

  constructor(public usersService: UsersService) { }

  ngOnInit() {
    this.usersService.fetchUsers();
  }

}
