import { BrowserWindow } from 'electron';
import { MainWindow } from '../main/main.window';
import { Window } from '../window';

export class SetupWindow extends Window {
  constructor() {
    super({ resizable: false, width: 500, height: 500, title: 'Setup' }, 'setup');
    this.window.on('closed', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        new MainWindow();
      }
    });
  }
}
