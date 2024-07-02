import { MainWindow } from '../main/main.window';
import { Window } from '../window';

export class SetupWindow extends Window {
  constructor() {
    super({ resizable: false, width: 600, height: 600, title: 'Setup', fullscreen: false }, 'setup');
    this.window.on('closed', () => {
      new MainWindow();
    });
  }
}
