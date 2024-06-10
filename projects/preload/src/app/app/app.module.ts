import { contextBridge } from 'electron';
import type { SharedModule } from '../../../../shared/shared.module';
import { DialogService } from './services/dialog/dialog.service';
import { GitService } from './services/git/git.service';
import { WindowService } from './services/window/window.service';

export class AppModule {
  api: SharedModule = {
    git: GitService,
    window: WindowService,
    dialog: DialogService
  };
  constructor() {
    contextBridge.exposeInMainWorld('electron', this.api);
  }
}
