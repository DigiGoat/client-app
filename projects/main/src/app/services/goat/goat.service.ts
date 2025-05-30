import { BrowserWindow, app, ipcMain } from 'electron';
import { ensureFileSync, exists, existsSync, readJson, watch, writeJSON } from 'fs-extra';
import { join } from 'path';
import type { GoatService as GoatServiceType } from '../../../../../shared/services/goat/goat.service';
import type { BackendService } from '../../../../../shared/shared.module';

export class GoatService {
  base = join(app.getPath('userData'), 'repo');
  does = join(this.base, 'src/assets/resources/does.json');
  bucks = join(this.base, 'src/assets/resources/bucks.json');
  references = join(this.base, 'src/assets/resources/references.json');
  forSale = join(this.base, 'src/assets/resources/for-sale.json');
  related = join(this.base, 'src/assets/resources/related.json');
  kiddingSchedule = join(this.base, 'src/assets/resources/kidding-schedule.json');
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
  async getReferences() {
    try {
      this.watchReferences();
      return await readJson(this.references);
    } catch (err) {
      console.warn('Error Reading References:', err);
      return [];
    }
  }
  async getForSale() {
    try {
      this.watchForSale();
      return await readJson(this.forSale);
    } catch (err) {
      console.warn('Error Reading For Sale:', err);
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
  async getKiddingSchedule() {
    try {
      this.watchKiddingSchedule();
      return await readJson(this.kiddingSchedule);
    } catch (err) {
      console.warn('Error Reading Kidding Schedule:', err);
      return [];
    }
  }
  api: BackendService<GoatServiceType> = {
    getDoes: async () => {
      return await this.getDoes();
    },
    setDoes: async (_event, does) => {
      await writeJSON(this.does, does, { spaces: 2 });
    },
    getBucks: async () => {
      return await this.getBucks();
    },
    setBucks: async (_event, bucks) => {
      await writeJSON(this.bucks, bucks, { spaces: 2 });
    },
    getReferences: async () => {
      return await this.getReferences();
    },
    setReferences: async (_event, references) => {
      await writeJSON(this.references, references, { spaces: 2 });
    },
    getForSale: async () => {
      return await this.getForSale();
    },
    setForSale: async (_event, forSale) => {
      await writeJSON(this.forSale, forSale, { spaces: 2 });
    },
    getRelated: async () => {
      return await this.getRelated();
    },
    setRelated: async (_event, related) => {
      await writeJSON(this.related, related, { spaces: 2 });
    },
    getKiddingSchedule: async () => {
      return await this.getKiddingSchedule();
    },
    setKiddingSchedule: async (_event, kiddingSchedule) => {
      await writeJSON(this.kiddingSchedule, kiddingSchedule, { spaces: 2 });
    },
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
        ipcMain.emit('goat:doesChange', newDoes);
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
        ipcMain.emit('goat:bucksChange', newBucks);
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
  watchingReferences = false;
  watchReferences() {
    if (this.watchingReferences || !existsSync(this.references)) return;
    ensureFileSync(this.references);
    this.watchingReferences = true;
    watch(this.references, async (event) => {
      try {
        const windows = BrowserWindow.getAllWindows();
        const newReferences = await this.getReferences();
        console.log('References updated', event, newReferences);
        ipcMain.emit('goat:referencesChange', newReferences);
        windows.forEach(window => {
          if (!window.isDestroyed()) {
            window.webContents.send('goat:referencesChange', newReferences);
          }
        });
      } catch (err) {
        console.warn('Error Updating References:', err);
      }
      if (event === 'rename') {
        this.watchingReferences = false;
        if (await exists(join(this.base, '.git'))) {
          this.watchReferences();
        }
      }
    }).on('error', async () => {
      this.watchingReferences = false;
      if (await exists(join(this.base, '.git'))) {
        this.watchReferences();
      }
    });
  }
  watchingForSale = false;
  watchForSale() {
    if (this.watchingForSale || !existsSync(this.forSale)) return;
    ensureFileSync(this.forSale);
    this.watchingForSale = true;
    watch(this.forSale, async (event) => {
      try {
        const windows = BrowserWindow.getAllWindows();
        const newForSale = await this.getForSale();
        console.log('For Sale updated', event, newForSale);
        ipcMain.emit('goat:forSaleChange', newForSale);
        windows.forEach(window => {
          if (!window.isDestroyed()) {
            window.webContents.send('goat:forSaleChange', newForSale);
          }
        });
      } catch (err) {
        console.warn('Error Updating Goats For Sale:', err);
      }
      if (event === 'rename') {
        this.watchingForSale = false;
        if (await exists(join(this.base, '.git'))) {
          this.watchForSale();
        }
      }
    }).on('error', async () => {
      this.watchingForSale = false;
      if (await exists(join(this.base, '.git'))) {
        this.watchForSale();
      }
    });
  }
  watchingRelated = false;
  watchRelated() {
    if (this.watchingRelated || !existsSync(this.related)) return;
    ensureFileSync(this.related);
    this.watchingRelated = true;
    watch(this.related, async (event) => {
      try {
        const windows = BrowserWindow.getAllWindows();
        const newRelated = await this.getRelated();
        console.log('Related updated', event, newRelated);
        ipcMain.emit('goat:relatedChange', newRelated);
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
  watchingKiddingSchedule = false;
  watchKiddingSchedule() {
    if (this.watchingKiddingSchedule || !existsSync(this.kiddingSchedule)) return;
    ensureFileSync(this.kiddingSchedule);
    this.watchingKiddingSchedule = true;
    watch(this.kiddingSchedule, async (event) => {
      try {
        const windows = BrowserWindow.getAllWindows();
        const newSchedule = await this.getKiddingSchedule();
        console.log('Kidding Schedule updated', event, newSchedule);
        ipcMain.emit('goat:kiddingScheduleChange', newSchedule);
        windows.forEach(window => {
          if (!window.isDestroyed()) {
            window.webContents.send('goat:kiddingScheduleChange', newSchedule);
          }
        });
      } catch (err) {
        console.warn('Error Updating Kidding Schedule:', err);
      }
      if (event === 'rename') {
        this.watchingKiddingSchedule = false;
        if (await exists(join(this.base, '.git'))) {
          this.watchKiddingSchedule();
        }
      }
    }).on('error', async () => {
      this.watchingKiddingSchedule = false;
      if (await exists(join(this.base, '.git'))) {
        this.watchKiddingSchedule();
      }
    });
  }
  constructor() {
    this.watchDoes();
    this.watchBucks();
    this.watchReferences();
    this.watchRelated();
    this.watchKiddingSchedule();
  }
}
