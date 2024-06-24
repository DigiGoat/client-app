import { BrowserWindow, app } from 'electron';
import { MainWindow } from '../main/main.window';
import { Window } from '../window';

export class LoginWindow extends Window {
  constructor() {
    super({ resizable: false, width: 500, height: 500, title: 'ADGA Login', fullscreen: false }, 'login');
    app.setSecureKeyboardEntryEnabled(true);
    this.window.on('closed', () => {
      app.setSecureKeyboardEntryEnabled(false);
      if (BrowserWindow.getAllWindows().length === 0) {
        new MainWindow();
      }
    });
  }
}
