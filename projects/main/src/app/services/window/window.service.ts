import { BrowserWindow, app } from 'electron';
import { WindowService as WindowServiceType } from '../../../../../shared/services/window/window.service';
import type { BackendService } from '../../../../../shared/shared.module';
import { GitWindow } from '../../windows/git/git.window';
import { MainWindow } from '../../windows/main/main.window';
import { SetupWindow } from '../../windows/setup/setup.window';

export class WindowService {
  api: BackendService<WindowServiceType> = {
    close: async (event, ignoreChanges) => {
      const window = BrowserWindow.fromWebContents(event.sender);
      if (ignoreChanges) {
        window.setDocumentEdited(false);
      }
      window.close();
    },
    openSetup: async () => {
      new SetupWindow();
    },
    openMain: async () => {
      new MainWindow();
    },
    openGit: async () => {
      new GitWindow();
    },
    quit: async () => {
      app.quit();
    },
    setUnsavedChanges: async (event, unsavedChanges) => {
      BrowserWindow.fromWebContents(event.sender).setDocumentEdited(unsavedChanges);
    }
  };
}
