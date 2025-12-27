import { Window } from '../window';

export class CustomPageWindow extends Window {
  constructor(index: number) {
    super(`custom-page/${index}`, { minWidth: 500, height: 500, fullscreen: false });
  }
}
