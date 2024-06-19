import { contextBridge } from 'electron';
import type { SharedModule } from '../../../../shared/shared.module';
import { ConfigService } from './services/config/config.service';
import { DialogService } from './services/dialog/dialog.service';
import { GitService } from './services/git/git.service';
import { WindowService } from './services/window/window.service';

export class AppModule {
  api: SharedModule = {
    git: GitService,
    window: WindowService,
    dialog: DialogService,
    config: ConfigService
  };
  constructor() {
    contextBridge.exposeInMainWorld('electron', this.api);
  }
}
