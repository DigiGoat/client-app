import { Window } from '../window';

export class MainWindow extends Window {
  constructor() {
    super({ minWidth: process.platform === 'darwin' ? 992 : 992 + 16, height: 600, title: 'DigiGoat' });
  }
}
