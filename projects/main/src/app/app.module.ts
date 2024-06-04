import { BrowserWindow, app } from 'electron';
import { MainWindow } from './main/main.window';
import { GitService } from './services/git/git.service';

export class AppModule {
  setupHandlers() {
    new GitService();
  }
  constructor() {
    // Handle creating/removing shortcuts on Windows when installing/uninstalling.
    if (require('electron-squirrel-startup')) {
      app.quit();
    }
    this.setupHandlers();


    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.on('ready', () => {
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
}
