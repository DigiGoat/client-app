import { app, ipcMain, type IpcMainInvokeEvent } from 'electron';
import { ensureDirSync } from 'fs-extra';
import { join } from 'path';
import { simpleGit, type SimpleGit } from 'simple-git';
import { WindowService as WindowServiceType } from '../../../../../shared/services/window/window.service';

export class WindowService {
  base = join(app.getPath('userData'), 'repo');
  api: WindowServiceType = {
    close: (async (event: IpcMainInvokeEvent): ReturnType<WindowServiceType['close']> => {
      event.sender.close();
    }) as WindowServiceType['close'],
  };
  git: SimpleGit;
  constructor() {
    ensureDirSync(this.base);
    this.git = simpleGit(this.base);
    ipcMain.handle('window:close', this.api.close);
  }
}
