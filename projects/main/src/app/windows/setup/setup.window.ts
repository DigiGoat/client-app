import { app, dialog, shell } from 'electron';
import { readJSON } from 'fs-extra';
import { join } from 'path';
import parse from 'semver/functions/parse';
import { MainWindow } from '../main/main.window';
import { Window } from '../window';

export class SetupWindow extends Window {
  constructor(payload?: string) {
    super(`setup${payload ? `?payload=${payload}` : ''}`, { resizable: false, width: 600, height: 600, title: 'Setup', fullscreen: false });
    let quitRequested = false;
    app.on('before-quit', () => quitRequested = true);
    this.window.on('closed', async () => {
      //await this.checkVersion();
      if (!quitRequested) { //Only open main window if setup was closed normally. If the app is quitting we don't want to open a new window
        new MainWindow();
      }
    });
  }
  async checkVersion() {
    try {
      const webVersion = parse((await readJSON(join(app.getPath('userData'), 'repo', 'package.json'))).version);
      const appVersion = parse(app.getVersion());
      if (webVersion.major > appVersion.major) {
        await dialog.showMessageBox({ message: 'App Update Required!', detail: 'Your app is outdated and needs to be updated to continue', type: 'error', buttons: ['OK'] });
        shell.openExternal('https://github.com/DigiGoat/client-app/releases');
        app.exit();
      } else if (webVersion.minor > appVersion.minor && webVersion.major === appVersion.major) {
        const action = await dialog.showMessageBox({ message: 'App Update Available!', detail: 'A new version of the app is available, would you like to update now?', type: 'question', buttons: ['Yes', 'No'] });
        if (action.response === 0) {
          shell.openExternal('https://github.com/DigiGoat/client-app/releases');
        }
      }
    } catch (e) {
      console.warn('Failed to check for updates with error:', e);
    }
  }
}
