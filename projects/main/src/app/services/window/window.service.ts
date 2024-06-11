import { app } from 'electron';
import { WindowService as WindowServiceType } from '../../../../../shared/services/window/window.service';
import type { BackendService } from '../../../../../shared/shared.module';
import { GitWindow } from '../../windows/git/git.window';
import { MainWindow } from '../../windows/main/main.window';
import { SetupWindow } from '../../windows/setup/setup.window';

export class WindowService {
  api: BackendService<WindowServiceType> = {
    close: async (event) => {
      event.sender.close();
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
    }
  };
}
