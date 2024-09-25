import { BrowserWindow, Menu, app, dialog, shell, type MenuItemConstructorOptions } from 'electron';
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
    const template: MenuItemConstructorOptions[] = [
      { role: 'fileMenu' },
      { role: 'editMenu' },
      /*app.isPackaged ? {
        label: 'View',
        submenu: [
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' }
        ]
      } : */{ role: 'viewMenu' },
      { role: 'windowMenu' },
      {
        role: 'help',
        submenu: [
          {
            label: 'View web-ui Repository',
            click: async () => {
              await shell.openExternal('https://github.com/DigiGoat/web-ui');
            }
          },
          {
            label: 'View client-app Repository',
            click: async () => {
              await shell.openExternal('https://github.com/DigiGoat/client-app');
            }
          }
        ]
      }
    ];
    if (process.platform === 'darwin') {
      template.unshift({ role: 'appMenu' });
    }
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);



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
        setTimeout(() => {
          if (BrowserWindow.getAllWindows().length === 0) {
            app.quit();
          }
        }, 1000);
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
        await dialog.showMessageBox({ message: 'App Update Required!', detail: 'Your app is outdated and needs to be updated to continue', type: 'error', buttons: ['OK'] });
        shell.openExternal('https://github.com/DigiGoat/client-app/releases');
        app.exit();
      } else if (webVersion.minor > appVersion.minor && webVersion.major >= appVersion.major) {
        const action = await dialog.showMessageBox({ message: 'App Update Recommended!', detail: 'A new version of the app is available, would you like to update now?', type: 'question', buttons: ['Yes', 'No'] });
        if (action.response === 0) {
          shell.openExternal('https://github.com/DigiGoat/client-app/releases');
        }
      }
    } catch (e) {
      console.warn('Failed to check for updates with error:', e);
    }
  }
}
