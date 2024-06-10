import { ipcMain } from 'electron';
import type { BackendSharedModule } from '../../../../shared/shared.module';
import { DialogService } from './dialog/dialog.service';
import { GitService } from './git/git.service';
import { WindowService } from './window/window.service';

export class ServiceModule {
  api: BackendSharedModule = {
    dialog: new DialogService().api,
    git: new GitService().api,
    window: new WindowService().api
  };
  constructor() {
    //@ts-expect-error Typescript does not like indexing a object with a string
    Object.keys(this.api).forEach(service => Object.keys(this.api[service]).forEach(key => ipcMain.handle(`${service}:${key}`, this.api[service][key])));
  }
}
