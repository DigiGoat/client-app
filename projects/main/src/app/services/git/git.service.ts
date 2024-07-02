import { execSync } from 'child_process';
import { BrowserWindow, app } from 'electron';
import { emptyDirSync, ensureDirSync } from 'fs-extra';
import { join } from 'path';
import { ResetMode, simpleGit, type SimpleGit, type SimpleGitProgressEvent } from 'simple-git';
import { GitService as GitServiceType } from '../../../../../shared/services/git/git.service';
import type { BackendService } from '../../../../../shared/shared.module';

export class GitService {
  base = join(app.getPath('userData'), 'repo');
  does = join(this.base, 'src/assets/resources/does.json');
  bucks = join(this.base, 'src/assets/resources/bucks.json');
  change() {
    BrowserWindow.getAllWindows().forEach(window => window.webContents.send('git:change'));
  }
  api: BackendService<GitServiceType> = {
    isRepo: async () => {
      return await this.git.checkIsRepo();
    },
    setup: async (_event, repo, name, email, token) => {
      emptyDirSync(this.base);
      await this.git.clone(`https://${token ? `${token}@` : ''}github.com/DigiGoat/${repo}.git`, '.');
      await this.git.addConfig('user.name', name || 'Digi');
      await this.git.addConfig('user.email', email || 'Digi@DigiGoat.farm');
    },
    updateSetup: async (_event, repo, name, email, token) => {
      await this.git.remote(['set-url', 'origin', `https://${token ? `${token}@` : ''}github.com/DigiGoat/${repo}.git`]);
      await this.git.addConfig('user.name', name || 'Digi');
      await this.git.addConfig('user.email', email || 'Digi@DigiGoat.farm');
    },
    version: async () => {
      return await this.git.version();
    },
    install: async () => {
      if (process.platform === 'win32') {
        execSync('start cmd /k "winget install Git.Git"');
      } else if (process.platform === 'darwin') {
        execSync('open -a Terminal $(which git)');
      } else {
        return Promise.reject('Unsupported platform');
      }
    },
    getPublishedDoes: async () => {
      return JSON.parse(await this.git.show('origin:./src/assets/resources/does.json'));
    },
    commitDoes: async (_event, message) => {
      await this.git.commit(message, this.does);
      this.change();
    },
    commitBucks: async (_event, message) => {
      await this.git.commit(message, this.bucks);
      this.change();
    },
    commitConfig: async (_event, message) => {
      await this.git.commit(message, 'src/assets/resources/config.json');
      this.change();
    },
    push: async () => {
      await this.git.push(['--force']);
      this.change();
    },
    reset: async () => {
      await this.git.reset(ResetMode.HARD, ['origin']);
      this.change();
    },
    getStatus: async () => {
      const status = await this.git.status();
      delete status.isClean;
      return status;
    },
  };
  git: SimpleGit;
  progress = (progress: SimpleGitProgressEvent) => {
    BrowserWindow.getAllWindows().forEach(window => window.webContents.send('git:progress', progress));
    console.log(`git.${progress.method} ${progress.stage} ${progress.progress}% complete`);
  };
  constructor() {
    ensureDirSync(this.base);
    this.git = simpleGit({ baseDir: this.base, progress: this.progress, config: ['credential.helper=""'] });
  }
}
