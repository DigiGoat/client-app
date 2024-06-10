import { app } from 'electron';
import { join } from 'path';
import { WindowService as WindowServiceType } from '../../../../../shared/services/window/window.service';
import type { BackendService } from '../../../../../shared/shared.module';
import { MainWindow } from '../../windows/main/main.window';
import { SetupWindow } from '../../windows/setup/setup.window';

export class WindowService {
  base = join(app.getPath('userData'), 'repo');
  api: BackendService<WindowServiceType> = {
    close: async (event) => {
      event.sender.close();
    },
    openSetup: async () => {
      new SetupWindow();
    },
    openMain: async () => {
      new MainWindow();
    }
  };
}
