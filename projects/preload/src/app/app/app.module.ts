import { contextBridge } from 'electron';
import type { SharedModule } from '../../../../shared/shared.module';
import { GitService } from './services/git/git.service';

export class AppModule {
  api: SharedModule = {
    git: GitService
  };
  constructor() {
    contextBridge.exposeInMainWorld('electron', this.api);
  }
}
