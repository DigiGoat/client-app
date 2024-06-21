import { BrowserWindow, app } from 'electron';
import { ensureFileSync, readJson, watch, writeJSON } from 'fs-extra';
import { join } from 'path';
import type { GoatService as GoatServiceType } from '../../../../../shared/services/goat/goat.service';
import type { BackendService } from '../../../../../shared/shared.module';

export class GoatService {
  base = join(app.getPath('userData'), 'repo');
  does = join(this.base, 'src/assets/resources/does.json');
  async getDoes() {
    try {
      return await readJson(this.does);
    } catch (err) {
      console.warn('Error Reading Does:', err);
      return [];
    }
  }
  api: BackendService<GoatServiceType> = {
    getDoes: async () => {
      return await this.getDoes();
    },
    setDoes: async (_event, does) => {
      await writeJSON(this.does, does);
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
  }
}
