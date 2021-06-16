import {Injectable} from '@angular/core';
import * as users from '../users.json';

export interface User {
  name: string;
  photo: string;
  cv: string;
  isEditing?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  public users: User[] = [];

  constructor() {
    this.fetchUsers();
  }


  public fetchUsers(): void {
    this.users = (users as any).default;
  }
}
