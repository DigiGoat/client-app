import { ipcMain } from 'electron';
import type { BackendSharedModule, SharedModule } from '../../../../shared/shared.module';
import { ADGAService } from './adga/adga.service';
import { AppService } from './app/app.service';
import { ConfigService } from './config/config.service';
import { DialogService } from './dialog/dialog.service';
import { GitService } from './git/git.service';
import { GoatService } from './goat/goat.service';
import { RepoService } from './repo/repo.service';
import { WindowService } from './window/window.service';

export class ServiceModule {
  api: BackendSharedModule = {
    dialog: new DialogService().api,
    git: new GitService().api,
    window: new WindowService().api,
    config: new ConfigService().api,
    goat: new GoatService().api,
    adga: new ADGAService().api,
    repo: new RepoService().api,
    app: new AppService().api
  };
  constructor() {
    Object.keys(this.api).forEach(service => Object.keys(this.api[service as keyof SharedModule]).forEach(key => ipcMain.handle(`${service}:${key}`, this.api[service as keyof SharedModule][key as keyof SharedModule[keyof SharedModule]])));
  }
}
