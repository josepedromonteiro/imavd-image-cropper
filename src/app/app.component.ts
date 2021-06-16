import {Component, ViewEncapsulation} from '@angular/core';
import {ElectronService} from "ngx-electron";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  constructor(private _electronService: ElectronService) {
    if (_electronService?.isElectronApp) {
      document.body.classList.add('electron');
    }



    if (_electronService?.isMacOS) {
      document.body.classList.add('mac-os');
    }

  }
}
