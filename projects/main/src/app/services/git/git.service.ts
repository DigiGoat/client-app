import { exec } from 'child_process';
import { BrowserWindow, app, dialog, shell } from 'electron';
import { emptyDirSync, ensureDirSync, exists, readJSON } from 'fs-extra';
import { join } from 'path';
import type { SemVer } from 'semver';
import parse from 'semver/functions/parse';
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
      await this.checkForUpdates();
    },
    updateSetup: async (_event, repo, name, email, token) => {
      await this.git.remote(['set-url', 'origin', `https://${token ? `${token}@` : ''}github.com/DigiGoat/${repo}.git`]);
      await this.git.addConfig('user.name', name || 'Digi');
      await this.git.addConfig('user.email', email || 'Digi@DigiGoat.farm');
    },
    setupDemo: async () => {
      emptyDirSync(this.base);
      await this.git.clone(`https://github.com/DigiGoat/${app.getVersion().includes('beta') ? 'beta-demo' : 'demo'}.git`, '.');
      await this.git.addConfig('user.name', 'Digi');
      await this.git.addConfig('user.email', 'Digi@DigiGoat.farm');
      await this.checkForUpdates();
    },
    setupBlank: async () => {
      emptyDirSync(this.base);
      await this.git.clone('https://github.com/DigiGoat/web-ui.git', '.', ['--branch', app.getVersion().includes('beta') ? 'beta' : 'main', '--single-branch']);
      await this.git.addConfig('user.name', 'Digi');
      await this.git.addConfig('user.email', 'Digi@DigiGoat.farm');
      await this.checkForUpdates();
    },
    version: async () => {
      return await this.git.version();
    },
    install: async () => {
      if (process.platform === 'win32') {
        exec('start cmd /k "winget install Git.Git --source winget"');
      } else if (process.platform === 'darwin') {
        exec('open -a Terminal $(which git)');
      } else {
        return Promise.reject('Unsupported platform');
      }
    },
    getPublishedDoes: async () => {
      return JSON.parse(await this.git.show('origin:./src/assets/resources/does.json'));
    },
    commitDoes: async (_event, message) => {
      try {
        await this.git.commit(message, this.does);
        this.change();
      } catch (err) {
        if ((err as Error).message.includes('nothing to commit')) {
          console.warn('Nothing to commit');
        } else {
          return Promise.reject(err);
        }
      }
    },
    commitBucks: async (_event, message) => {
      try {
        await this.git.commit(message, this.bucks);
        this.change();
      } catch (err) {
        if ((err as Error).message.includes('nothing to commit')) {
          console.warn('Nothing to commit');
        } else {
          return Promise.reject(err);
        }
      }
    },
    commitConfig: async (_event, message) => {
      try {
        await this.git.commit(message, 'src/assets/resources/config.json');
        this.change();
      } catch (err) {
        if ((err as Error).message.includes('nothing to commit')) {
          console.warn('Nothing to commit');
        } else {
          return Promise.reject(err);
        }
      }
    },
    push: async () => {
      await this.git.push(['--force']);
      this.change();
    },
    reset: async () => {
      await this.git.reset(ResetMode.HARD, ['origin']);
      this.change();
      await this.checkForUpdates();
    },
    getStatus: async () => {
      const status = await this.git.status();
      delete status.isClean;
      return status;
    },
    fetchUpdate: async () => {
      console.debug('Checking for upstream remote...');
      const remotes = await this.git.getRemotes();
      if (!remotes.find(remote => remote.name.includes('upstream'))) {
        console.debug('upstream remote not found, adding...');
        await this.git.addRemote('upstream', 'https://github.com/DigiGoat/web-ui.git');
      }
      console.debug('Fetching upstream...');
      await this.git.fetch('upstream', app.getVersion().includes('beta') ? 'beta' : 'main');
      console.debug('Checking for updates...');
      const newVersion = parse(JSON.parse(await this.git.show('FETCH_HEAD:package.json')).version);
      return newVersion;
    },
    readUpdate: async () => {
      const newVersion = parse(JSON.parse(await this.git.show(`upstream/${app.getVersion().includes('beta') ? 'beta' : 'main'}:package.json`)).version);
      return newVersion;
    },
    installUpdates: async () => {
      const oldVersion = parse((await readJSON(join(this.base, 'package.json'))).version);
      const newVersion = parse(JSON.parse(await this.git.show(`upstream/${app.getVersion().includes('beta') ? 'beta' : 'main'}:package.json`)).version);
      await this.git.merge([`upstream/${app.getVersion().includes('beta') ? 'beta' : 'main'}`, '--message', `Updated web-ui from v${oldVersion} to v${newVersion}`, '--commit', '--no-edit', '--no-ff']);
      this.change();
      return newVersion;
    },
    commitImages: async (_event, paths, message) => {
      paths = paths.map(path => `src/assets/images/${path}`);
      for (const path of paths) {
        if (await exists(join(this.base, path))) {
          await this.git.add(path);
        }
      }
      paths.push('src/assets/images/map.json');
      try {
        await this.git.commit(message, paths);
        this.change();
      } catch (err) {
        if ((err as Error).message.includes('nothing to commit')) {
          console.warn('Nothing to commit');
        } else {
          return Promise.reject(err);
        }
      }
    },
    commitFavicon: async () => {
      try {
        await this.git.add(join(this.base, 'src/assets/icons/'));
        await this.git.commit('Updated favicon', 'src/assets/icons/');
      } catch (err) {
        if ((err as Error).message.includes('nothing to commit')) {
          console.warn('Nothing to commit');
        } else {
          return Promise.reject(err);
        }
      }
    }
  };
  git: SimpleGit;
  progress = (progress: SimpleGitProgressEvent) => {
    BrowserWindow.getAllWindows().forEach(window => window.webContents.send('git:progress', progress));
    console.log(`git.${progress.method} ${progress.stage} ${progress.progress}% complete`);
  };
  constructor() {
    ensureDirSync(this.base);
    this.git = simpleGit({ baseDir: this.base, progress: this.progress, config: ['credential.helper=""', 'commit.gpgsign=false'] });
    this.checkForUpdates();
  }
  async checkForUpdates() {
    try {
      console.debug('Checking for upstream remote...');
      const remotes = await this.git.getRemotes();
      if (!remotes.find(remote => remote.name.includes('upstream'))) {
        console.debug('upstream remote not found, adding...');
        await this.git.addRemote('upstream', 'https://github.com/DigiGoat/web-ui.git');
      }
      console.debug('Fetching upstream...');
      await this.git.fetch('upstream', app.getVersion().includes('beta') ? 'beta' : 'main');
      console.debug('Checking for updates...');
      const newVersion = parse(JSON.parse(await this.git.show('FETCH_HEAD:package.json')).version);
      const oldVersion = parse((await readJSON(join(this.base, 'package.json'))).version);
      const appVersion = parse(app.getVersion());
      if (app.isReady()) {
        this.determineUpdates(oldVersion, newVersion, appVersion);
      } else {
        app.once('ready', () => this.determineUpdates(oldVersion, newVersion, appVersion));
      }
    } catch (e) {
      console.warn('Failed to Check For Updates (Non-Fatal):', e);
    }
  }
  async determineUpdates(oldVersion: SemVer, newVersion: SemVer, appVersion: SemVer) {
    console.debug('Current version:', oldVersion.toString(), 'New version:', newVersion.toString());
    if (newVersion.major > oldVersion.major && newVersion.major > appVersion.major) {
      //Major update available, will require the app to be updated
      const action = await dialog.showMessageBox({ message: 'Web Update Available!', detail: 'This update REQUIRES that you update the app to install', type: 'question', buttons: ['OK', 'Later'], cancelId: 1, defaultId: 0 });
      if (action.response === 0) {
        shell.openExternal('https://github.com/DigiGoat/client-app/releases');
      }
    } else if (newVersion.minor > oldVersion.minor && newVersion.minor > appVersion.minor) {
      //Minor update available, will prompt the user to update
      const action = await dialog.showMessageBox({ message: 'Web Update Available!', detail: 'This update RECOMMENDS that you update the app to install', type: 'question', buttons: ['Install', 'Later'], cancelId: 1, defaultId: 0 });
      if (action.response === 0) {
        await this.installUpdates(oldVersion.toString(), newVersion.toString());
      }
    } else if (oldVersion.compare(newVersion) < 0 && oldVersion.major >= appVersion.major) {
      //Patch update available, will prompt the user to update
      const action = await dialog.showMessageBox({ message: 'Web Update Available!', detail: 'This update DOES NOT REQUIRE that you update the app to install', type: 'question', buttons: ['Install', 'Later'], cancelId: 1, defaultId: 0 });
      if (action.response === 0) {
        await this.installUpdates(oldVersion.toString(), newVersion.toString());
      }
    }
  }
  async installUpdates(oldVersion: string, newVersion: string) {
    await this.git.merge([`upstream/${app.getVersion().includes('beta') ? 'beta' : 'main'}`, '--message', `Updated web-ui from v${oldVersion} to v${newVersion}`, '--commit', '--no-edit', '--no-ff']);
    this.change();
  }
}
