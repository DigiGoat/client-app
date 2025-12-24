import { BrowserWindow, app } from 'electron';
import { MainWindow } from '../main/main.window';
import { Window } from '../window';

export class LoginWindow extends Window {
  constructor() {
    super({ resizable: false, width: 500, height: 500, title: 'ADGA Login', fullscreen: false }, 'login');
    try {
      app.setSecureKeyboardEntryEnabled(true);
    } catch (e) {
      //Do nothing, this just means we aren't on Mac
    }
    this.window.on('closed', () => {
      try {
        app.setSecureKeyboardEntryEnabled(false);
      } catch (e) {
        //Do nothing, this just means we aren't on Mac
      }
      if (BrowserWindow.getAllWindows().length === 0) {
        new MainWindow();
      }
    });
  }
}
