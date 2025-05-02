import axios from 'axios';
import { exec as _exec, spawn, type ChildProcess, type ExecOptions } from 'child_process';
import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { dialog } from 'electron/main';
import { createWriteStream, ensureDir, exists, move, readJSON, rm } from 'fs-extra';
import { join } from 'path';
import { satisfies } from 'semver';
import { extract } from 'tar';
import treeKill from 'tree-kill';
import { Open } from 'unzipper';
import { stripVTControlCharacters } from 'util';

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
      PATH: this.nodeBin
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
      closable: false,
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
        treeKill(this.server.pid, 'SIGINT');
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
      await this.checkDependencies();

      this.window.setClosable(true);
      console.log('Starting server');
      this.notifyProgress(Progress.START_SERVER);
      this.notifyChanges();
      this.watchChanges();

      this.server = spawn('yarn', ['start'], {
        shell: process.platform === 'win32',
        ...this.spawnOptions
      });

      this.server.stdout.on('data', data => {
        data = stripVTControlCharacters(data.toString()); //Strip out the ANSI color characters that are outputted on Windows
        console.log('yarn start:', data);
        if (data.includes('Local')) {
          const match = data.match(/Local:\s+(http:\/\/\S+)/);
          console.log('Match:', match);
          const url = match ? match[1] : 'http://localhost:4000';
          console.log('Preview URL:', url);
          this.window.loadURL(url);
          this.window.on('ready-to-show', () => {
            if (!this.window.isVisible()) {
              this.window.show();
              this.window.setSize(992, 600);
              this.window.center();
            }
          });
        } else if (data.includes('Would you like to use a different port? (Y/n)')) {
          console.log('Port Busy, retrying...');
          this.server.stdin.write('\r\n');
        }
      });
      this.server.stderr.on('data', data => {
        console.error('yarn start:', data.toString());
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
      this.window.setClosable(true);
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
        detail: 'This is required to run the preview server. This will REQUIRE an internet connection',
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
  async checkDependencies() {
    this.notifyProgress(Progress.CHECK_DEPENDENCIES);
    try {
      console.log('Checking dependencies');
      await exec('yarn install --offline', this.spawnOptions);
    } catch (error) {
      const result = await dialog.showMessageBox({
        type: 'error',
        message: 'Dependencies Incomplete',
        detail: 'They are required to run the preview server. This will REQUIRE an internet connection and may take some time',
        buttons: ['Install', 'Cancel'],
      });
      if (result.response === 0) {
        await this.installDependencies();
      } else {
        throw 'Close Window';
      }
    }
  }
  async installDependencies() {
    this.notifyProgress(Progress.INSTALL_DEPENDENCIES);
    try {
      console.log('Installing dependencies');
      await exec('yarn install', this.spawnOptions);
      await this.checkDependencies();
    } catch (error) {
      console.error(error);
      dialog.showErrorBox('Failed To Install Dependencies', 'Please check your internet connection and try again');
      throw 'Close Window';
    }
  }

  async watchChanges() {
    ipcMain.on('goat:doesChange', () => {
      console.log('Does change detected');
      this.window?.reload();
    });
    ipcMain.on('goat:bucksChange', () => {
      console.log('Bucks change detected');
      this.window?.reload();
    });
    ipcMain.on('goat:referencesChange', () => {
      console.log('References change detected');
      this.window?.reload();
    });
    ipcMain.on('goat:forSaleChange', () => {
      console.log('For Sale change detected');
      this.window?.reload();
    });
    ipcMain.on('goat:relatedChange', () => {
      console.log('Related change detected');
      this.window?.reload();
    });
    ipcMain.on('goat:kiddingScheduleChange', () => {
      console.log('Kidding Schedule change detected');
      this.window?.reload();
    });
  }

  notifyChanges() {
    BrowserWindow.getAllWindows().forEach(window => window.webContents.send('preview:change'));
  }
  notifyProgress(progress: Progress) {
    BrowserWindow.getAllWindows().forEach(window => window.webContents.send('preview:progress', progress / Progress.START_SERVER));
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
  START_SERVER
}
async function exec(command: string, options?: ExecOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    const server = _exec(command, { ...options, encoding: 'utf8' }, (error, stdout: string) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout.trim());
      }
    });
    server.stdout.on('data', data => console.log(`${command}:`, data));
    server.stderr.on('data', data => console.error(`${command}:`, data));
  });
}
