import { init } from '@sentry/electron/main';
import { app, BrowserWindow, dialog, Menu, shell, type MenuItemConstructorOptions } from 'electron';
import { readJSON } from 'fs-extra';
import { join, resolve } from 'path';
import parse from 'semver/functions/parse';
import { ServiceModule } from './services/service.module';
import { MainWindow } from './windows/main/main.window';
import { SetupWindow } from './windows/setup/setup.window';

export class AppModule {
  openedByDeepLink = false;
  constructor() {
    // Handle creating/removing shortcuts on Windows when installing/uninstalling.
    if (require('electron-squirrel-startup')) {
      app.quit();
    }
    init({
      dsn: 'https://5cb98f8e2125a9f35721b4a2e66d3e57@o4510677771681792.ingest.us.sentry.io/4510677777317888',
      enableLogs: true,
      environment: app.isPackaged ? app.getVersion().includes('beta') ? 'beta' : 'production' : 'development',
      debug: !app.isPackaged,
    });
    new ServiceModule();
    const template: MenuItemConstructorOptions[] = [
      { role: 'fileMenu' },
      { role: 'editMenu' },
      (app.isPackaged && !app.getVersion().includes('beta')) ? {
        label: 'View',
        submenu: [
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' }
        ]
      } : { role: 'viewMenu' },
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


    this.configureDeepLink();
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.on('ready', async () => {
      if (!this.openedByDeepLink) {
        await this.checkVersion();
        new MainWindow();
      }
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
      } else if (webVersion.minor > appVersion.minor && webVersion.major === appVersion.major) {
        const action = await dialog.showMessageBox({ message: 'App Update Recommended!', detail: 'A new version of the app is available, would you like to update now?', type: 'question', buttons: ['Yes', 'No'] });
        if (action.response === 0) {
          shell.openExternal('https://github.com/DigiGoat/client-app/releases');
        }
      }
    } catch (e) {
      console.warn('Failed to check for updates with error:', e);
    }
  }

  configureDeepLink() {
    if (process.defaultApp) {
      if (process.argv.length >= 2) {
        app.setAsDefaultProtocolClient('digigoat', process.execPath, [resolve(process.argv[1])]);
      }
    } else {
      app.setAsDefaultProtocolClient('digigoat');
    }
    app.on('open-url', (event, url) => {
      this.handleDeepLink(new URL(url));
    });
    const gotTheLock = app.requestSingleInstanceLock();

    if (!gotTheLock) {
      app.quit();
    } else {
      const url = process.argv.find(arg => arg.startsWith('digigoat://'));
      if (url) {
        this.handleDeepLink(new URL(url));
      }
      app.on('second-instance', (event, commandLine) => {
        const url = commandLine.find(arg => arg.startsWith('digigoat://'));
        if (url) {
          this.handleDeepLink(new URL(url));
        }
      });
    }
  }

  handleDeepLink(url: URL) {
    const handleUrl = () => {
      switch (url.host) {
        case 'setup':
          this.prepareSetupWindow(url.searchParams.get('payload') || '');
          break;
        default:
          break;
      }
    };
    if (app.isReady()) {
      handleUrl();
    } else {
      this.openedByDeepLink = true;
      app.once('ready', handleUrl);
    }

  }
  prepareSetupWindow(payload: string) {
    let activeSetup = true;
    app.once('will-quit', event => {
      if (activeSetup) {
        event.preventDefault();
        new SetupWindow(payload);
      }
    });
    app.quit();
    app.once('before-quit', () => app.once('before-quit', () => activeSetup = false)); //If the app is being told to quit again, then another window is at play. (Two quit's is okay though because that just means that changes are being saved)
  }
}
