import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DockService {
  constructor() {
  }

  public activateSideBar(): void {
    document.documentElement.style.setProperty('--side-bar-width', '350px');
  }

  public removeSideBar(): void {
    document.documentElement.style.setProperty('--side-bar-width', '0px');
  }
}
