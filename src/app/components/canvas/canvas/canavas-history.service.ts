import {Injectable} from '@angular/core';
import {CanvasService} from './canvas.service';
import {take} from "rxjs/operators";


@Injectable({
  providedIn: 'root'
})
export class CanvasHistoryService {
  public state = [];
  public mods = 0;

  constructor(private canvasService: CanvasService) {

    this.canvasService.onCanvasReady.pipe(
    ).subscribe((canvas) => {
      canvas.on(
        'object:modified', () => {
          console.log('modified');
          this.updateModifications(true);
        },
        'object:added', () => {
          console.log('added');
          this.updateModifications(true);
        });
      canvas.counter = 0;
      canvas.selection = false;
    });


  }

  public updateModifications(savehistory: boolean): void {
    if (savehistory === true) {
      const myjson: string = JSON.stringify(this.canvasService.canvas);
      this.state.push(myjson);
    }
  }

  public undo() {
    if (this.mods < this.state.length) {
      this.canvasService.canvas.clear().renderAll();
      this.canvasService.canvas.loadFromJSON(this.state[this.state.length - 1 - this.mods - 1]);
      this.canvasService.canvas.renderAll();
      this.mods += 1;
    }
  }

  public redo(): void {
    if (this.mods > 0) {
      this.canvasService.canvas.clear().renderAll();
      this.canvasService.canvas.loadFromJSON(this.state[this.state.length - 1 - this.mods + 1]);
      this.canvasService.canvas.renderAll();
      this.mods -= 1;
    }
  }
}
