import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export enum CANVAS_ACTIONS {
  CUTTING,
  PICKING_COLOR
}

@Injectable({
  providedIn: 'root'
})
export class CanvasActionService {
  public activeActions: BehaviorSubject<CANVAS_ACTIONS[]> = new BehaviorSubject<CANVAS_ACTIONS[]>([]);
  public actions: typeof CANVAS_ACTIONS = CANVAS_ACTIONS;

  public addAction(action: CANVAS_ACTIONS): void {
    const foundActionIndex = this.actionIndex(action);
    if (foundActionIndex > -1) {
      return;
    }
    this.activeActions.next([...this.activeActions.getValue(), action]);
  }

  public removeAction(action: CANVAS_ACTIONS): void {
    const foundActionIndex = this.actionIndex(action);
    if (foundActionIndex > -1) {
      this.activeActions.next(this.activeActions.getValue().filter(activeAction => activeAction !== action));
    }
  }

  public isActionActive(action: CANVAS_ACTIONS): boolean {
    return this.actionIndex(action) > -1;
  }

  public actionIndex(action: CANVAS_ACTIONS): number {
    return this.activeActions.getValue().findIndex(activeAction => activeAction === action);
  }
}
