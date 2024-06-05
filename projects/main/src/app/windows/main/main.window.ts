import { app, BrowserWindow } from 'electron';
import { join } from 'path';

export class MainWindow {
  base = join(__dirname, '../../../../');
  constructor() {
    this.createWindow();
  }
  private window?: BrowserWindow;
  createWindow() {
    this.window = new BrowserWindow({
      show: false,
      minWidth: 992, //Minimum width for the bootstrap menubar
      webPreferences: {
        preload: join(this.base, 'preload/bundle.js')
      }
    });

    const startURL = app.isPackaged ? `file://${join(this.base, 'renderer/browser', 'index.html')}` : 'http://localhost:4200';

    this.window.loadURL(startURL);
    this.window.on('ready-to-show', () => {
      this.show();
    });
  }
  show() {
    this.window?.show();
    this.window?.setSize(992, 600);
    this.window?.center();
  }
}
