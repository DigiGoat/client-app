import { Window } from '../window';

export class KiddingWindow extends Window {
  constructor(index: number) {
    super(`kidding/${index}`, { minWidth: 1000, width: 1200, minHeight: 400, height: 600, fullscreen: false });
  }
}