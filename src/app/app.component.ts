import {Component, ViewEncapsulation} from '@angular/core';
import {ElectronService} from 'ngx-electron';
import {IpcRendererEvent, ipcMain} from 'electron';

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
    if (navigator.platform.indexOf('Mac') > -1) {
      document.body.classList.add('mac-os');
    }

    this._electronService?.ipcRenderer?.on('isFullscreen', (event: IpcRendererEvent, args) => {
      if (args) {
        document.body.classList.add('fullscreen');
      } else {
        document.body.classList.remove('fullscreen');
      }
    });

  }
}
