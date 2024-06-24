import { MainWindow } from '../main/main.window';
import { Window } from '../window';

export class SetupWindow extends Window {
  constructor() {
    super({ resizable: false, width: 500, height: 500, title: 'Setup', fullscreen: false }, 'setup');
    this.window.on('closed', () => {
      new MainWindow();
    });
  }
}
