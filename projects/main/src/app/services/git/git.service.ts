import { app, ipcMain } from 'electron';
import { emptyDirSync, ensureDirSync } from 'fs-extra';
import { join } from 'path';
import { simpleGit, type SimpleGit } from 'simple-git';
import { GitService as GitServiceType } from '../../../../../shared/services/git/git.service';

export class GitService {
  base = join(app.getPath('userData'), 'repo');
  api: GitServiceType = {
    info: async (): ReturnType<GitServiceType['info']> => {
      const info = await this.git.version();
      return { installed: info.installed, version: `v${info.major}.${info.minor}.${info.patch}` };
    },
    isRepo: async (): ReturnType<GitServiceType['isRepo']> => {
      return await this.git.checkIsRepo();
    },
    init: async (): ReturnType<GitServiceType['init']> => {
      emptyDirSync(this.base);
      await this.git.clone('https://github.com/digigoat/web-ui', '.');
    }
  };
  git: SimpleGit;
  constructor() {
    ensureDirSync(this.base);
    this.git = simpleGit(this.base);
    ipcMain.handle('git:info', this.api.info);
    ipcMain.handle('git:isRepo', this.api.isRepo);
    ipcMain.handle('git:init', this.api.init);
  }
}
