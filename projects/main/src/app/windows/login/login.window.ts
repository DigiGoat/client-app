import { app } from 'electron';
import { Window } from '../window';

export class LoginWindow extends Window {
  constructor() {
    super('login', { resizable: false, width: 500, height: 500, title: 'ADGA Login', fullscreen: false });
    if (this.window) {
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
      });
    }
  }
}
