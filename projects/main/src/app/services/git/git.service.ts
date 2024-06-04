import { ipcMain } from 'electron';
import { simpleGit, type SimpleGit } from 'simple-git';
import { GitService as GitServiceType } from '../../../../../shared/services/git/git.service';

export class GitService {
  api: GitServiceType = {
    info: async (): ReturnType<GitServiceType['info']> => {
      const info = await this.git.version();
      return { installed: info.installed, version: `v${info.major}.${info.minor}.${info.patch}` };
    }
  };
  git: SimpleGit;
  constructor(repoDir?: string) {
    this.git = simpleGit(repoDir);
    Object.keys(this.api).forEach(key => {
      //@ts-expect-error - This needs to be fixed later
      ipcMain.handle(`git:${key}`, (event, ...args) => this.api[key as keyof GitServiceType](...args));
    });
  }
}
