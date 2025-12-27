import { exec, execSync } from 'child_process';
import { BrowserWindow, app, dialog, shell } from 'electron';
import { emptyDirSync, ensureDirSync, exists, readJSON, writeFile } from 'fs-extra';
import { join } from 'path';
import type { SemVer } from 'semver';
import parse from 'semver/functions/parse';
import { CleanOptions, ResetMode, simpleGit, type SimpleGit, type SimpleGitProgressEvent } from 'simple-git';
import { GitService as GitServiceType } from '../../../../../shared/services/git/git.service';
import type { BackendService } from '../../../../../shared/shared.module';

export class GitService {
  base = join(app.getPath('userData'), 'repo');
  does = join(this.base, 'src/assets/resources/does.json');
  bucks = join(this.base, 'src/assets/resources/bucks.json');
  references = join(this.base, 'src/assets/resources/references.json');
  change() {
    BrowserWindow.getAllWindows().forEach(window => window.webContents.send('git:change'));
  }
  async commit(message: string | string[], files: string | string[]) {
    const commitPath = join(app.getPath('temp'), `commit-${Date.now()}.txt`);
    if (message instanceof Array) {
      message[0] += '\n';
      message = message.join('\n');
    }
    writeFile(commitPath, message);
    try {
      return await this.git.raw('commit', '-F', commitPath, ...(files instanceof Array ? files : [files]));
    } catch (err) {
      if ((err as Error).message.includes('nothing to commit')) {
        console.warn('Nothing to commit');
      } else if ((err as Error).message.includes('LF will be replaced by CRLF the next time Git touches it')) {
        console.warn('Git will change line endings on next commit');
      } else {
        return Promise.reject(err);
      }
    }
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
      // Wait to run check until a window is opened since if updates need to be installed it will be handled by the setup window
      //app.once('browser-window-created', () => {
      this.checkForUpdates();
      //});
    },
    updateSetup: async (_event, repo, name, email, token) => {
      await this.git.remote(['set-url', 'origin', `https://${token ? `${token}@` : ''}github.com/DigiGoat/${repo}.git`]);
      await this.git.addConfig('user.name', name);
      await this.git.addConfig('user.email', email);
      await this.checkForUpdates(); // Immediately pull new changes
    },
    version: async () => {
      return await this.git.version();
    },
    install: async () => {
      if (process.platform === 'win32') {
        exec('start cmd /k "winget install Git.Git --source winget"');
      } else if (process.platform === 'darwin') {
        exec('open -a Terminal $(which git)');
        execSync('osascript -e \'tell app "Terminal" to activate\' -e \'tell app "Terminal" to do script "$(which git)"\'');
      } else {
        return Promise.reject('Unsupported platform');
      }
    },
    trust: async () => {
      execSync('osascript -e \'tell app "Terminal" to activate\' -e \'tell app "Terminal" to do script "sudo xcodebuild -license && exit"\'');
    },
    getPublishedDoes: async () => {
      return JSON.parse(await this.git.show('origin:./src/assets/resources/does.json'));
    },
    commitDoes: async (_event, message) => {
      await this.commit(message, this.does);
      this.change();
    },
    commitBucks: async (_event, message) => {
      await this.commit(message, this.bucks);
      this.change();
    },
    commitReferences: async (_event, message) => {
      await this.commit(message, this.references);
      this.change();
    },
    commitForSale: async (_event, message) => {
      await this.commit(message, 'src/assets/resources/for-sale.json');
      this.change();
    },
    commitConfig: async (_event, message) => {
      await this.commit(message, 'src/assets/resources/config.json');
      this.change();

    },
    commitSettings: async (_event, message) => {
      await this.commit(message, 'src/assets/resources/settings.json');
      this.change();

    },
    commitRelated: async (_event, message) => {
      await this.commit(message, 'src/assets/resources/related.json');
      this.change();
    },
    commitKiddingSchedule: async (_event, message) => {
      await this.commit(message, 'src/assets/resources/kidding-schedule.json');
      this.change();
    },
    commitCustomPages: async (_event, message) => {
      await this.commit(message, 'src/assets/resources/custom-pages.json');
      this.change();
    },
    publish: async () => {
      try {
        await this.checkForUpdates();
      } catch (error) {
        const response = await dialog.showMessageBox({
          message: 'Sync Error',
          detail: 'Failed to download latest changes from remote repository. Please either choose to overwrite your local changes by resetting to the last published state of your website or overwrite the remote changes including any edits made on other devices',
          type: 'warning',
          buttons: ['Overwrite Remote Changes (Default)', 'Overwrite Local Changes', 'Cancel'],
          defaultId: 0,
          cancelId: 2
        });
        if (response.response === 0) {
          await this.git.push(['--force']);
        } else if (response.response === 1) {
          await this.git.reset(ResetMode.HARD, ['@{upstream}']);
        }
        this.change();
        return;
      }
      await this.git.push();
      this.change();
    },
    reset: async () => {
      await this.git.clean(CleanOptions.FORCE);
      await this.git.reset(ResetMode.HARD, ['@{upstream}']);
      this.change();
      this.checkForUpdates();
    },
    clean: async () => {
      await this.git.clean(CleanOptions.FORCE);
      this.change();
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
      await this.git.clean(CleanOptions.FORCE);
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
      await this.commit(message, paths);
      this.change();
    },
    commitFavicon: async () => {
      await this.git.add(join(this.base, 'src/assets/icons/'));
      await this.commit('Updated favicon', 'src/assets/icons/');
      this.change();
    },
    getSetup: async () => {
      //`https://${token ? `${token}@` : ''}github.com/DigiGoat/${repo}.git`
      try {
        const remoteUrl = (await this.git.getRemotes(true)).find(remote => remote.name === 'origin').refs.fetch;
        return {
          name: (await this.git.getConfig('user.name')).value,
          email: (await this.git.getConfig('user.email')).value,
          token: remoteUrl.includes('@') ? remoteUrl.split('@')[0].split('https://')[1] : undefined,
          repo: remoteUrl.split('github.com/DigiGoat/')[1].split('.git')[0]
        };
      } catch (err) {
        console.warn('Error Getting Setup:', err);
        return {};
      }
    },
    getHistory: async () => {
      const upstreams = (await this.git.branch(['-r'])).all.filter(branch => branch.includes('upstream'));
      return {
        local: await this.git.log(['@{u}..', ...upstreams.map(branch => `^${branch}`)]),
        remote: await this.git.log(['@{u}', ...upstreams.map(branch => `^${branch}`)]),
      };
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
    await this.pullChanges();

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
      let unparsedNewVersion = JSON.parse(await this.git.show('FETCH_HEAD:package.json')).version;
      let unparsedOldVersion = (await readJSON(join(this.base, 'package.json'))).version;
      if (!app.getVersion().includes('beta')) {
        unparsedNewVersion = unparsedNewVersion.split('-')[0];
        unparsedOldVersion = unparsedOldVersion.split('-')[0];
      }
      const newVersion = parse(unparsedNewVersion);
      const oldVersion = parse(unparsedOldVersion);
      const appVersion = parse(app.getVersion());
      if (app.isReady()) {
        this.determineUpdates(oldVersion, newVersion, appVersion);
      } else {
        app.once('ready', () => this.determineUpdates(oldVersion, newVersion, appVersion));
      }
    } catch (e) {
      console.warn('Failed to Check For Updates (Non-Fatal):', e);
      this.scheduleUpdateCheck(true);
    }
  }
  async pullChanges() {
    console.debug('Attempting to pull the latest changes...');

    try {
      // Use rebase=merges so we don't create new merge commits, but keep existing ones.
      const data = await this.git.pull(['--rebase=merges']);

      this.change();
      if (data.files.length) {
        dialog.showMessageBox({
          message: 'Successfully downloaded changes done to your website!',
          detail: 'If you don\'t remember making changes on another device, then they\'re likely from lactation records syncing. Go the the history page and check for the author "Digi" to be sure'
        });
      }
    } catch (err) {
      console.warn('(Non-Fatal) Startup Pull Failed with Error:', err);

      // If the pull left us in a conflicted state, abort so JSON files are restored.
      try {
        const status = await this.git.status();
        if (status.conflicted?.length) {
          console.warn('Conflicts detected during startup pull, aborting rebase/merge...');
          // Prefer aborting rebase; if that fails, try merge abort.
          await this.git.rebase((['--abort'])).catch(() =>
            this.git.merge(['--abort']).catch()
          );
        }
      } catch (abortErr) {
        console.warn('Failed to inspect/abort conflicted state:', abortErr);
      }
    }
  }
  async determineUpdates(oldVersion: SemVer, newVersion: SemVer, appVersion: SemVer) {
    console.debug('Current version:', oldVersion.toString(), 'New version:', newVersion.toString());
    if (newVersion.major > oldVersion.major && newVersion.major > appVersion.major) {
      //Major update available, will require the app to be updated
      const action = await dialog.showMessageBox({ message: 'Web Update Available!', detail: 'This update REQUIRES that you update the app to install', type: 'question', buttons: ['View...', 'Later'], cancelId: 1, defaultId: 0 });
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
    this.scheduleUpdateCheck();
  }
  async installUpdates(oldVersion: string, newVersion: string) {
    await this.git.merge([`upstream/${app.getVersion().includes('beta') ? 'beta' : 'main'}`, '--message', `Updated web-ui from v${oldVersion} to v${newVersion}`, '--commit', '--no-edit', '--no-ff']);
    this.change();
  }

  existingCheck?: NodeJS.Timeout;
  scheduleUpdateCheck(quickCheck?: boolean) {
    clearTimeout(this.existingCheck);
    this.existingCheck = setTimeout(() => {
      this.checkForUpdates();
    }, 1000 * 60 * (quickCheck ? 5 : 60)); // Check every hour (or every 5 minutes if this is a quick check)
  }
}
