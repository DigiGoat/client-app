import { BrowserWindow, app } from 'electron';
import { WindowService as WindowServiceType } from '../../../../../shared/services/window/window.service';
import type { BackendService } from '../../../../../shared/shared.module';
import { GitWindow } from '../../windows/git/git.window';
import { GoatWindow } from '../../windows/goat/goat.window';
import { ImageWindow } from '../../windows/image/image.window';
import { ImageOptimizeWindow } from '../../windows/image/optimize/optimize.window';
import { LoginWindow } from '../../windows/login/login.window';
import { MainWindow } from '../../windows/main/main.window';
import { SetupWindow } from '../../windows/setup/setup.window';

export class WindowService {
  api: BackendService<WindowServiceType> = {
    close: async (event, ignoreChanges, ignoreClosable) => {
      const window = BrowserWindow.fromWebContents(event.sender);
      if (ignoreChanges) {
        window.setDocumentEdited(false);
        window.setTitle('');
      }
      if (ignoreClosable) {
        window.setClosable(true);
      }
      window.close();
    },
    openSetup: async () => {
      const window = BrowserWindow.getAllWindows().find(window => window.webContents.getURL().includes('#/setup'));
      if (window) {
        if (window.isMinimized()) {
          window.restore();
        }
        window.focus();
      } else {
        new SetupWindow();
      }
    },
    openMain: async () => {
      const window = BrowserWindow.getAllWindows().find(window => window.webContents.getURL().includes('#/main'));
      if (window) {
        if (window.isMinimized()) {
          window.restore();
        }
        window.focus();
      } else {
        new MainWindow();
      }
    },
    openGit: async () => {
      const window = BrowserWindow.getAllWindows().find(window => window.webContents.getURL().includes('#/git'));
      if (window) {
        if (window.isMinimized()) {
          window.restore();
        }
        window.focus();
      } else {
        new GitWindow();
      }
    },
    openLogin: async () => {
      const window = BrowserWindow.getAllWindows().find(window => window.webContents.getURL().includes('#/login'));
      if (window) {
        if (window.isMinimized()) {
          window.restore();
        }
        window.focus();
      } else {
        new LoginWindow();
      }
    },
    quit: async (_event, relaunch) => {
      if (relaunch) {
        app.relaunch();
        app.exit(); //Ensure that the quit is not cancelled
      } else {
        app.quit();
      }
    },
    setUnsavedChanges: async (event, unsavedChanges) => {
      const window = BrowserWindow.fromWebContents(event.sender);
      window.setDocumentEdited(unsavedChanges);
      if (process.platform !== 'darwin') {
        let title = window.title;
        while (title.endsWith('*')) {
          title = title.slice(0, -1);
        }
        if (unsavedChanges) {
          title += '*';
        }
        window.setTitle(title);
      }
    },
    setClosable: async (event, closable) => {
      BrowserWindow.fromWebContents(event.sender).setClosable(closable);
    },
    openGoat: async (event, type, index) => {
      const windows = BrowserWindow.getAllWindows();
      const window = windows.find(window => window.webContents.getURL().endsWith(`goat/${type}/${index}`));
      const otherWindow = windows.find(window => window.webContents.getURL().includes('#/goat'));
      if (window) {
        if (window.isMinimized()) {
          window.restore();
        }
        window.focus();
      } else if (otherWindow) {
        let attempts = 0;
        otherWindow.on('close', () => attempts++);
        otherWindow.on('closed', () => {
          if (attempts < 3 /*If there are changes, it takes two attempts to close the window*/) {
            new GoatWindow(type, index);
          }
        });
        otherWindow.close();
      } else {
        new GoatWindow(type, index);
      }
    },
    setTitle: async (event, title) => {
      BrowserWindow.fromWebContents(event.sender).setTitle(title);
    },
    openImages: async (_event, searchQueries) => {
      const windows = BrowserWindow.getAllWindows();
      const window = windows.find(window => window.webContents.getURL().includes('#/image') && searchQueries.find(query => window.webContents.getURL().includes(query)));
      const otherWindow = windows.find(window => window.webContents.getURL().includes('#/image'));
      if (window) {
        if (window.isMinimized()) {
          window.restore();
        }
        window.focus();
      } else if (otherWindow) {
        let attempts = 0;
        otherWindow.on('close', () => attempts++);
        otherWindow.on('closed', () => {
          if (attempts < 3 /*If there are changes, it takes two attempts to close the window*/) {
            new ImageWindow(searchQueries);
          }
        });
        otherWindow.close();
      } else {
        new ImageWindow(searchQueries);
      }
    },
    refreshMain: async () => {
      const windows = BrowserWindow.getAllWindows();
      const window = windows.find(window => window.webContents.getURL().includes('#/main'));
      if (window) {
        window.on('closed', () => {
          new MainWindow();
        });
        window.setDocumentEdited(false);
        window.setTitle('');
        window.close();
      }
    },
    openImageOptimizer: async () => {
      const windows = BrowserWindow.getAllWindows();
      const window = windows.find(window => window.webContents.getURL().includes('#/image/optimize'));
      if (window) {
        if (window.isMinimized()) {
          window.restore();
        }
        window.focus();
      } else {
        new ImageOptimizeWindow();
      }
    }
  };
}
