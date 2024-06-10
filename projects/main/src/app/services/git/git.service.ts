import { app } from 'electron';
import { emptyDirSync, ensureDirSync } from 'fs-extra';
import { join } from 'path';
import { simpleGit, type SimpleGit } from 'simple-git';
import { GitService as GitServiceType } from '../../../../../shared/services/git/git.service';
import type { BackendService } from '../../../../../shared/shared.module';

export class GitService {
  base = join(app.getPath('userData'), 'repo');
  api: BackendService<GitServiceType> = {
    isRepo: async () => {
      return await this.git.checkIsRepo();
    },
    setup: async (_event, repo, token) => {
      emptyDirSync(this.base);
      await this.git.clone(`https://${token ? `${token}@` : ''}github.com/DigiGoat/${repo}.git`, '.');
    }
  };
  git: SimpleGit;
  constructor() {
    ensureDirSync(this.base);
    this.git = simpleGit(this.base);
  }
}
