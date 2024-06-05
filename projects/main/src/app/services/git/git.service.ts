import { app, ipcMain } from 'electron';
import { ensureDirSync } from 'fs-extra';
import { join } from 'path';
import { simpleGit, type SimpleGit } from 'simple-git';
import { GitService as GitServiceType } from '../../../../../shared/services/git/git.service';

export class GitService {
  base = join(app.getPath('userData'), 'repo');
  api: GitServiceType = {
    isRepo: async (): ReturnType<GitServiceType['isRepo']> => {
      return await this.git.checkIsRepo();
    }
  };
  git: SimpleGit;
  constructor() {
    ensureDirSync(this.base);
    this.git = simpleGit(this.base);
    ipcMain.handle('git:isRepo', this.api.isRepo);
  }
}
