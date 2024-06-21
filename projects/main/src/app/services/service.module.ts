import { ipcMain } from 'electron';
import type { BackendSharedModule, SharedModule } from '../../../../shared/shared.module';
import { ConfigService } from './config/config.service';
import { DialogService } from './dialog/dialog.service';
import { GitService } from './git/git.service';
import { GoatService } from './goat/goat.service';
import { WindowService } from './window/window.service';

export class ServiceModule {
  api: BackendSharedModule = {
    dialog: new DialogService().api,
    git: new GitService().api,
    window: new WindowService().api,
    config: new ConfigService().api,
    goat: new GoatService().api
  };
  constructor() {
    Object.keys(this.api).forEach(service => Object.keys(this.api[service as keyof SharedModule]).forEach(key => ipcMain.handle(`${service}:${key}`, this.api[service as keyof SharedModule][key as keyof SharedModule[keyof SharedModule]])));
  }
}
