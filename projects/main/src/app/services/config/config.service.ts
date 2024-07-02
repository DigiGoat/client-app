import { BrowserWindow, app } from 'electron';
import { ensureFileSync, readJson, watch, writeJson } from 'fs-extra';
import { join } from 'path';
import { ConfigService as ConfigServiceType } from '../../../../../shared/services/config/config.service';
import type { BackendService } from '../../../../../shared/shared.module';


export class ConfigService {
  base = join(app.getPath('userData'), 'repo');
  config = join(this.base, 'src/assets/resources/config.json');
  async getConfig() {
    try {
      return await readJson(this.config);
    } catch (err) {
      console.warn('Error Reading Config:', err);
      return {};
    }
  }
  api: BackendService<ConfigServiceType> = {
    get: async () => {
      return await this.getConfig();
    },
    set: async (_event, config) => {
      ensureFileSync(this.config);
      await writeJson(this.config, config);
    }
  };
  constructor() {
    ensureFileSync(this.config);
    watch(this.config, async () => {
      try {
        const windows = BrowserWindow.getAllWindows();
        const newConfig = await this.getConfig();
        console.log('Config updated', newConfig);
        windows.forEach(window => {
          if (!window.isDestroyed()) {
            window.webContents.send('config:change', newConfig);
          }
        });
      } catch (err) {
        console.warn('Error Updating Config:', err);
      }
    });
  }
}
