import { app, BrowserWindow } from 'electron';
import { join } from 'path';

export class MainWindow {
  base = join(__dirname, '../../../');
  constructor() {
    this.createWindow();
  }
  private window?: BrowserWindow;
  createWindow() {
    // Create the browser window.
    this.window = new BrowserWindow({
      show: false,
      webPreferences: {
        preload: join(this.base, 'preload/bundle.js')
      }
    });

    const startURL = app.isPackaged ? `file://${join(this.base, 'renderer/browser', 'index.html')}` : 'http://localhost:4200';

    this.window.loadURL(startURL);
    this.window.on('ready-to-show', () => {
      this.window?.show();
    });
  }
}
