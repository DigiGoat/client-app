import { Window } from '../window';

export class MainWindow extends Window {
  constructor() {
    super({ minWidth: 992, height: 600, title: 'DigiGoat' });
  }
}
