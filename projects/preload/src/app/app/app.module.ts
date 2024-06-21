import { contextBridge } from 'electron';
import type { SharedModule } from '../../../../shared/shared.module';
import { ConfigService } from './services/config/config.service';
import { DialogService } from './services/dialog/dialog.service';
import { GitService } from './services/git/git.service';
import { GoatService } from './services/goat/goat.service';
import { WindowService } from './services/window/window.service';

export class AppModule {
  api: SharedModule = {
    git: GitService,
    window: WindowService,
    dialog: DialogService,
    config: ConfigService,
    goat: GoatService
  };
  constructor() {
    contextBridge.exposeInMainWorld('electron', this.api);
  }
}
