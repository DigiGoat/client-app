import type { GoatType } from '../../../../../shared/services/goat/goat.service';
import { Window } from '../window';

export class GoatWindow extends Window {
  constructor(type: GoatType, index: number) {
    super({ minWidth: 500, height: 500, fullscreen: false }, `goat/${type}/${index}`);
  }
}
