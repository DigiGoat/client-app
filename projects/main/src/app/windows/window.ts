import { app, BrowserWindow, shell, type BrowserWindowConstructorOptions } from 'electron';
import { join } from 'path';

export class Window {
  private base = join(__dirname, '../../../');
  protected window?: BrowserWindow;
  constructor(options?: BrowserWindowConstructorOptions, path?: string) {
    this.window = new BrowserWindow({
      show: false,
      backgroundColor: 'hsl(230, 100%, 10%)',
      useContentSize: true,
      webPreferences: {
        preload: join(this.base, 'preload/bundle.js')
      },
      ...options
    });

    const startURL = app.isPackaged ? `file://${join(this.base, 'renderer/browser', 'index.html')}#${path ?? ''}` : `http://localhost:4200/#/${path ?? ''}`;

    this.window.loadURL(startURL);
    this.window.once('ready-to-show', () => {
      if (!this.window.isVisible()) {
        this.window.show();
        this.window.setSize(options.width ?? options.minWidth ?? options.maxWidth ?? -1, options.height ?? options.minHeight ?? options.maxHeight ?? -1);
        this.window.center();
      }
    });

    this.window.on('close', event => {
      if (this.window.documentEdited || this.window.title.endsWith('*')) {
        event.preventDefault();
        this.window.webContents.send('window:onsave');
      }
    });
    this.window.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' };
    });
  }
}
