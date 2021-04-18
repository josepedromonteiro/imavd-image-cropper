import { animate, style, transition, trigger } from '@angular/animations';

const DURATION = '6s linear';
const SHOW_STYLE = {
  transform: 'scale(1)',
  opacity: 1
};
const HIDE_STYLE = {
  transform: 'scale(0)',
  opacity: 0
};
export const CONTEXT_ANIMATION = trigger('contextAnimation', [
  transition(':enter', [
    style(HIDE_STYLE),  // initial
    animate(DURATION,
      style(SHOW_STYLE))  // final
  ]),
  transition(':leave', [
    style(SHOW_STYLE),  // initial
    animate(DURATION,
      style(HIDE_STYLE))  // final
  ])
]);
