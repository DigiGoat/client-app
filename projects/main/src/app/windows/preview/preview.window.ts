import axios from 'axios';
import { exec as _exec, spawn, type ChildProcess, type ExecOptions } from 'child_process';
import { app, BrowserWindow, shell } from 'electron';
import { dialog } from 'electron/main';
import { createWriteStream, ensureDir, exists, move, readJSON, rm } from 'fs-extra';
import { join } from 'path';
import { satisfies } from 'semver';
import { extract } from 'tar';
import treeKill from 'tree-kill';
import { Open } from 'unzipper';

export class PreviewWindow {
  protected window?: BrowserWindow;
  protected server?: ChildProcess;

  private base = app.getPath('userData');
  private nodeBinary = join(this.base, 'node');
  private nodeBin = join(this.base, process.platform === 'darwin' ? 'node/bin' : 'node');
  private cache = join(this.base, '.cache');
  private corepack = join(this.cache, 'corepack');
  private yarnCache = join(this.cache, 'yarn');
  private repoBase = join(this.base, 'repo');

  private spawnOptions = {
    cwd: this.repoBase,
    env: {
      COREPACK_HOME: this.corepack,
      YARN_CACHE_FOLDER: this.yarnCache,
      COREPACK_ENABLE_AUTO_PIN: '0',
      PATH: this.nodeBin,
    },
  };

  constructor() {
    this.startServer();
    this.window = new BrowserWindow({
      show: false,
      backgroundColor: 'grey',
      useContentSize: true,
      minWidth: 401,
      minHeight: 500,
    });

    this.notifyChanges();
    this.window.on('closed', () => {
      this.notifyChanges();
    });
    this.window.on('show', () => {
      this.notifyChanges();
    });

    this.window.on('close', event => {
      if (this.server && !this.server.stdout.closed) {
        event.preventDefault();
        if (process.platform === 'win32') {
          treeKill(this.server.pid, 'SIGINT');
        } else {
          this.server.kill('SIGINT');
        }
      }
    });
    this.window.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' };
    });
    app.on('before-quit', () => {
      if (!this.window.isDestroyed()) {
        let attempts = 0;
        this.window.on('close', () => attempts++);
        this.window.on('closed', () => {
          if (attempts === 2 /*If there are changes, it takes two attempts to close the window*/) {
            app.quit();
          }
        });
      }
    });
  }

  async startServer() {
    try {
      await this.checkNode();
      await this.checkYarn();
      await this.installDependencies();

      console.log('Starting server');
      this.notifyProgress(Progress.START_SERVER);

      this.server = spawn('yarn', ['start'], {
        shell: process.platform === 'win32',
        ...this.spawnOptions
      });

      this.server.stdout.on('data', data => {
        console.log('>', data.toString());
        if (data.toString().includes('Local') || data.toString().includes('is already in use')) {
          const match = (data.toString() as string).match(/Local:\s+(http:\/\/\S+)/);
          //On windows, the characters get decoded real funky so you can't match the URL
          const url = match ? match[1] : 'http://localhost:4000';
          this.window.loadURL(url);
          this.window.on('ready-to-show', () => {
            if (!this.window.isVisible()) {
              this.window.show();
              this.window.setSize(992, 600);
              this.window.center();
            }
          });
        }
      });
      this.server.stderr.on('data', data => {
        console.error('>', data.toString());
      });
      this.server.on('close', () => {
        console.log('Server closed');
        this.window?.close();
      });
      this.server.on('error', error => {
        console.error('Server error:', error);
        dialog.showErrorBox('Failed To Start Preview:', error.message);
        this.window?.close();
      });
    } catch (error) {
      if (error !== 'Close Window') {
        console.error('Error starting server:', error);
        dialog.showErrorBox('Failed To Start Preview:', error);
      }
      this.window?.close();
    }
  }

  async checkNode() {
    console.log('Checking node version');
    this.notifyProgress(Progress.CHECK_NODE);
    if (!await exists(this.nodeBinary)) {
      const result = await dialog.showMessageBox({
        type: 'error',
        message: 'Node.js Not Found',
        detail: 'This is required to run the preview server',
        buttons: ['Download', 'Cancel'],
      });
      if (result.response === 0) {
        await this.downloadNode();
      } else {
        throw 'Close Window';
      }
    }
    try {
      const nodeVersion = await exec('node -v', this.spawnOptions);
      const acceptableVersions = (await readJSON(join(this.base, 'repo/package.json'))).engines.node;
      if (!satisfies(nodeVersion, acceptableVersions)) {
        throw new Error(`Node version ${nodeVersion} does not satisfy ${acceptableVersions}`);
      }
      console.log(`Node version is acceptable (${nodeVersion})`);
    } catch (error) {
      const result = await dialog.showMessageBox({
        type: 'error',
        message: 'Incompatible Node.js Installation',
        detail: 'This is required to run the preview server',
        buttons: ['Update', 'Cancel'],
      });
      if (result.response === 0) {
        await this.downloadNode();
      } else {
        throw 'Close Window';
      }
    }
  }
  async downloadNode() {
    this.notifyProgress(Progress.DOWNLOAD_NODE);
    try {
      await rm(this.nodeBinary, { recursive: true, force: true });

      const NODE_VERSION = 'v22.14.0';

      const PLATFORM = process.platform === 'darwin' ? 'darwin' : 'win';
      const ARCH = process.arch;

      const file = PLATFORM === 'darwin' ? `node-${NODE_VERSION}-darwin-${ARCH}.tar.gz` : `node-${NODE_VERSION}-win-${ARCH}.zip`;
      const url = `https://nodejs.org/dist/${NODE_VERSION}/${file}`;

      const archive = join(this.cache, file);
      if (await exists(archive)) {
        console.log('Node.js already downloaded.');
      } else {
        console.log('Downloading node');

        await ensureDir(this.cache);

        const stream = await axios.get(url, {
          responseType: 'stream',
        });

        const writer = createWriteStream(archive);
        await new Promise<void>((resolve, reject) => {
          stream.data.pipe(writer);
          writer.on('finish', () => {
            console.log('Node.js downloaded successfully.');
            resolve();
          });
          writer.on('error', (err) => {
            console.error('Error writing to file:', err);
            reject(err);
          });
        });
      }

      console.log('Unzipping node');
      this.notifyProgress(Progress.UNPACK_NODE);
      if (PLATFORM === 'win') {
        // Use unzipper to unzip on Windows
        await (await Open.file(archive)).extract({ path: this.cache });
      } else {
        // Use tar to extract on Mac
        await extract({
          file: archive,
          cwd: this.cache
        });
      }

      const extractedPath = join(this.cache, file.replace(/\.(tar\.gz|zip)$/, ''));
      await ensureDir(this.nodeBinary);
      await move(extractedPath, this.nodeBinary, { overwrite: true });

      await this.checkNode();
    } catch (error) {
      console.error(error);
      dialog.showErrorBox('Failed to Download Node.js', 'Please check your internet connection and try again');
      throw 'Close Window';
    }
  }

  async checkYarn() {
    console.log('Checking yarn version');
    this.notifyProgress(Progress.CHECK_YARN);
    try {
      const yarnVersion = await exec('yarn -v', this.spawnOptions);
      console.log(`Yarn found (${yarnVersion})`);
    } catch (error) {
      await this.enableYarn();
    }
  }

  async enableYarn() {
    this.notifyProgress(Progress.ENABLE_YARN);
    try {
      console.log('Enabling yarn');
      await exec('corepack enable yarn', this.spawnOptions);
      await this.checkYarn();
    } catch (error) {
      console.error(error);
      dialog.showErrorBox('Failed To Enable Yarn:', error);
      throw 'Close Window';
    }
  }
  async installDependencies() {
    this.notifyProgress(Progress.INSTALL_DEPENDENCIES);
    try {
      console.log('Installing dependencies');
      await exec('yarn install --prefer-offline', this.spawnOptions);
    } catch (error) {
      console.error(error);
      dialog.showErrorBox('Failed To Install Dependencies', 'Please check your internet connection and try again');
      throw 'Close Window';
    }
  }

  notifyChanges() {
    BrowserWindow.getAllWindows().forEach(window => window.webContents.send('preview:change'));
  }
  notifyProgress(progress: Progress) {
    BrowserWindow.getAllWindows().forEach(window => window.webContents.send('preview:progress', progress / Progress.DONE));
  }
}
enum Progress {
  NONE,
  CHECK_NODE,
  DOWNLOAD_NODE,
  UNPACK_NODE,
  CHECK_YARN,
  ENABLE_YARN,
  CHECK_DEPENDENCIES,
  INSTALL_DEPENDENCIES,
  START_SERVER,
  SPACER,
  DONE
}
async function exec(command: string, options?: ExecOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    _exec(command, { ...options, encoding: 'utf8' }, (error, stdout: string) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout.trim());
      }
    });
  });
}
