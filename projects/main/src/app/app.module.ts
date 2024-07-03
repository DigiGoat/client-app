import { BrowserWindow, app, dialog, shell } from 'electron';
import { readJSON } from 'fs-extra';
import { join } from 'path';
import parse from 'semver/functions/parse';
import { ServiceModule } from './services/service.module';
import { MainWindow } from './windows/main/main.window';

export class AppModule {
  constructor() {
    // Handle creating/removing shortcuts on Windows when installing/uninstalling.
    if (require('electron-squirrel-startup')) {
      app.quit();
    }
    new ServiceModule();


    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.on('ready', async () => {
      await this.checkVersion();
      new MainWindow();
    });

    // Quit when all windows are closed, except on macOS. There, it's common
    // for applications and their menu bar to stay active until the user quits
    // explicitly with Cmd + Q.
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      // On OS X it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) {
        new MainWindow();
      }
    });
  }
  async checkVersion() {
    try {
      const webVersion = parse((await readJSON(join(app.getPath('userData'), 'repo', 'package.json'))).version);
      const appVersion = parse(app.getVersion());
      if (webVersion.major > appVersion.major) {
        await dialog.showMessageBox({ message: 'Update Required!', detail: 'Your app is outdated and needs to be updated to continue', type: 'error', buttons: ['OK'] });
        shell.openExternal('https://github.com/DigiGoat/beta-demo/releases');
        app.exit();
      } else if (webVersion.minor > appVersion.minor) {
        const action = await dialog.showMessageBox({ message: 'Update Available!', detail: 'A new version of the app is available, would you like to update now?', type: 'question', buttons: ['Yes', 'No'] });
        if (action.response === 0) {
          shell.openExternal('https://github.com/DigiGoat/beta-demo/releases');
        }
      }
    } catch (e) {
      console.warn('Failed to check for updates with error:', e);
    }
  }
}
