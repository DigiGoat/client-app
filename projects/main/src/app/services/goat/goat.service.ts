import { BrowserWindow, app } from 'electron';
import { ensureFileSync, exists, readJson, watch, writeJSON } from 'fs-extra';
import { join } from 'path';
import type { GoatService as GoatServiceType } from '../../../../../shared/services/goat/goat.service';
import type { BackendService } from '../../../../../shared/shared.module';

export class GoatService {
  base = join(app.getPath('userData'), 'repo');
  does = join(this.base, 'src/assets/resources/does.json');
  bucks = join(this.base, 'src/assets/resources/bucks.json');
  related = join(this.base, 'src/assets/resources/related.json');
  async getDoes() {
    try {
      this.watchDoes();
      return await readJson(this.does);
    } catch (err) {
      console.warn('Error Reading Does:', err);
      return [];
    }
  }
  async getBucks() {
    try {
      this.watchBucks();
      return await readJson(this.bucks);
    } catch (err) {
      console.warn('Error Reading Bucks:', err);
      return [];
    }
  }
  async getRelated() {
    try {
      this.watchRelated();
      return await readJson(this.related);
    } catch (err) {
      console.warn('Error Reading Related:', err);
      return [];
    }
  }
  api: BackendService<GoatServiceType> = {
    getDoes: async () => {
      return await this.getDoes();
    },
    setDoes: async (_event, does) => {
      await writeJSON(this.does, does);
    },
    getBucks: async () => {
      return await this.getBucks();
    },
    setBucks: async (_event, bucks) => {
      await writeJSON(this.bucks, bucks);
    },
    getRelated: async () => {
      return await this.getRelated();
    },
    setRelated: async (_event, related) => {
      await writeJSON(this.related, related);
    }
  };
  watchingDoes = false;
  watchDoes() {
    if (this.watchingDoes) return;
    ensureFileSync(this.does);
    this.watchingDoes = true;
    watch(this.does, async (event) => {
      try {
        const windows = BrowserWindow.getAllWindows();
        const newDoes = await this.getDoes();
        console.log('Does updated', event, newDoes);
        windows.forEach(window => {
          if (!window.isDestroyed()) {
            window.webContents.send('goat:doesChange', newDoes);
          }
        });
      } catch (err) {
        console.warn('Error Updating Does:', err);
      }
      if (event === 'rename') {
        this.watchingDoes = false;
        if (await exists(join(this.base, '.git'))) {
          this.watchDoes();
        }
      }
    }).on('error', async () => {
      this.watchingDoes = false;
      if (await exists(join(this.base, '.git'))) {
        this.watchDoes();
      }
    });
  }
  watchingBucks = false;
  watchBucks() {
    if (this.watchingBucks) return;
    ensureFileSync(this.bucks);
    this.watchingBucks = true;
    watch(this.bucks, async (event) => {
      try {
        const windows = BrowserWindow.getAllWindows();
        const newBucks = await this.getBucks();
        console.log('Bucks updated', event, newBucks);
        windows.forEach(window => {
          if (!window.isDestroyed()) {
            window.webContents.send('goat:bucksChange', newBucks);
          }
        });
      } catch (err) {
        console.warn('Error Updating Bucks:', err);
      }
      if (event === 'rename') {
        this.watchingBucks = false;
        if (await exists(join(this.base, '.git'))) {
          this.watchBucks();
        }
      }
    }).on('error', async () => {
      this.watchingBucks = false;
      if (await exists(join(this.base, '.git'))) {
        this.watchBucks();
      }
    });
  }
  watchingRelated = false;
  watchRelated() {
    if (this.watchingRelated) return;
    ensureFileSync(this.related);
    this.watchingRelated = true;
    watch(this.related, async (event) => {
      try {
        const windows = BrowserWindow.getAllWindows();
        const newRelated = await this.getRelated();
        console.log('Related updated', event, newRelated);
        windows.forEach(window => {
          if (!window.isDestroyed()) {
            window.webContents.send('goat:relatedChange', newRelated);
          }
        });
      } catch (err) {
        console.warn('Error Updating Related:', err);
      }
      if (event === 'rename') {
        this.watchingRelated = false;
        if (await exists(join(this.base, '.git'))) {
          this.watchRelated();
        }
      }
    }).on('error', async () => {
      this.watchingRelated = false;
      if (await exists(join(this.base, '.git'))) {
        this.watchRelated();
      }
    });
  }
  constructor() {
    this.watchDoes();
    this.watchBucks();
    this.watchRelated();
  }
}
