import { BrowserWindow, app } from 'electron';
import { ensureFileSync, readJson, watch, writeJSON } from 'fs-extra';
import { join } from 'path';
import type { GoatService as GoatServiceType } from '../../../../../shared/services/goat/goat.service';
import type { BackendService } from '../../../../../shared/shared.module';

export class GoatService {
  base = join(app.getPath('userData'), 'repo');
  does = join(this.base, 'src/assets/resources/does.json');
  bucks = join(this.base, 'src/assets/resources/bucks.json');
  async getDoes() {
    try {
      return await readJson(this.does);
    } catch (err) {
      console.warn('Error Reading Does:', err);
      return [];
    }
  }
  async getBucks() {
    try {
      return await readJson(this.bucks);
    } catch (err) {
      console.warn('Error Reading Bucks:', err);
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
    }
  };
  constructor() {
    ensureFileSync(this.does);
    watch(this.does, async () => {
      const windows = BrowserWindow.getAllWindows();
      const newDoes = await this.getDoes();
      console.log('Does updated', newDoes);
      windows.forEach(window => {
        if (!window.isDestroyed()) {
          window.webContents.send('goat:doesChange', newDoes);
        }
      });
    });
    ensureFileSync(this.bucks);
    watch(this.bucks, async () => {
      const windows = BrowserWindow.getAllWindows();
      const newBucks = await this.getBucks();
      console.log('Bucks updated', newBucks);
      windows.forEach(window => {
        if (!window.isDestroyed()) {
          window.webContents.send('goat:bucksChange', newBucks);
        }
      });
    });
  }
}