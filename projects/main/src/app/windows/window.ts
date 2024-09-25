import { app, BrowserWindow, Menu, MenuItem, shell, type BrowserWindowConstructorOptions } from 'electron';
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
    app.on('before-quit', () => {
      if (!this.window.isDestroyed()) {
        this.window.setClosable(true);
        let attempts = 0;
        this.window.on('close', () => attempts++);
        this.window.on('closed', () => {
          if (attempts === 2 /*If there are changes, it takes two attempts to close the window*/) {
            app.quit();
          }
        });
      }
    });
    this.window.webContents.on('context-menu', (_event, params) => {
      const menu = new Menu();

      // Add each spelling suggestion
      for (const suggestion of params.dictionarySuggestions) {
        menu.append(new MenuItem({
          label: suggestion,
          click: () => this.window.webContents.replaceMisspelling(suggestion)
        }));
      }

      // Allow users to add the misspelled word to the dictionary
      if (params.misspelledWord) {
        menu.append(new MenuItem({
          type: 'separator'
        }));
        menu.append(
          new MenuItem({
            label: `Add '${params.misspelledWord}' To Dictionary`,
            click: () => this.window.webContents.session.addWordToSpellCheckerDictionary(params.misspelledWord)
          })
        );
      }

      menu.popup();
    });
  }
}
