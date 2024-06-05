import { contextBridge } from 'electron';
import type { SharedModule } from '../../../../shared/shared.module';
import { GitService } from './services/git/git.service';
import { WindowService } from './services/window/window.service';

export class AppModule {
  api: SharedModule = {
    git: GitService,
    window: WindowService
  };
  constructor() {
    contextBridge.exposeInMainWorld('electron', this.api);
  }
}
