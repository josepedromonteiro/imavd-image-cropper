import { animate, state, style, transition, trigger } from '@angular/animations';

const DURATION = '.6s cubic-bezier(0.16, 1, 0.3, 1)';
const SHOW_STYLE = {
  maxHeight: '{{startHeight}}px',
  opacity: 1,
  margin: '*',
  padding: '*'
};
const HIDE_STYLE = {
  maxHeight: '0',
  opacity: 0,
  padding: 0,
  overflow: 'hidden'
};
export const CONTENT_ANIMATION = trigger('contentAnimation', [
  state('1', style(SHOW_STYLE), { params: { startHeight: 300} }),
  state('0', style(HIDE_STYLE)),
  transition('1 <=> 0', animate(DURATION)),
]);


const TOGGLE_SHOW_STYLE = {
  transform: 'rotate(90deg)'
};
const TOGGLE_HIDE_STYLE = {
  transform: 'rotate(0)'
};

export const TOGGLE_ANIMATION = trigger('toggleAnimation', [
  state('1', style(TOGGLE_SHOW_STYLE)),
  state('0', style(TOGGLE_HIDE_STYLE)),
  transition('1 <=> 0', animate(DURATION)),
]);
