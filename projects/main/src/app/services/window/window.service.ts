import { app, ipcMain, type IpcMainInvokeEvent } from 'electron';
import { join } from 'path';
import { WindowService as WindowServiceType } from '../../../../../shared/services/window/window.service';
import { MainWindow } from '../../windows/main/main.window';
import { SetupWindow } from '../../windows/setup/setup.window';

export class WindowService {
  base = join(app.getPath('userData'), 'repo');
  api: WindowServiceType = {
    close: (async (event: IpcMainInvokeEvent): ReturnType<WindowServiceType['close']> => {
      event.sender.close();
    }) as WindowServiceType['close'],
    openSetup: async () => {
      new SetupWindow();
    },
    openMain: async () => {
      new MainWindow();
    }
  };
  constructor() {
    ipcMain.handle('window:close', this.api.close);
    ipcMain.handle('window:openSetup', this.api.openSetup);
    ipcMain.handle('window:openMain', this.api.openMain);
  }
}
