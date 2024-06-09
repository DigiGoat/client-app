import { app, ipcMain } from 'electron';
import { emptyDirSync, ensureDirSync } from 'fs-extra';
import { join } from 'path';
import { simpleGit, type SimpleGit } from 'simple-git';
import { GitService as GitServiceType } from '../../../../../shared/services/git/git.service';

export class GitService {
  base = join(app.getPath('userData'), 'repo');
  api: GitServiceType = {
    isRepo: async (): ReturnType<GitServiceType['isRepo']> => {
      return await this.git.checkIsRepo();
    },
    setup: async (repo: string, token?: string): ReturnType<GitServiceType['setup']> => {
      emptyDirSync(this.base);
      await this.git.clone(`https://${token ? `${token}@` : ''}github.com/DigiGoat/${repo}.git`, '.');
    }
  };
  git: SimpleGit;
  constructor() {
    ensureDirSync(this.base);
    this.git = simpleGit(this.base);
    ipcMain.handle('git:isRepo', this.api.isRepo);
    ipcMain.handle('git:setup', (_event, repo, token) => this.api.setup(repo, token));
  }
}
