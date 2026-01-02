import { BrowserWindow, app } from 'electron';
import { existsSync } from 'fs';
import { ensureFileSync, readJson, watch, writeJson } from 'fs-extra';
import { join } from 'path';
import { ConfigService as ConfigServiceType } from '../../../../../shared/services/config/config.service';
import type { BackendService } from '../../../../../shared/shared.module';


export class ConfigService {
  base = join(app.getPath('userData'), 'repo');
  config = join(this.base, 'src/assets/resources/config.json');
  async getConfig() {
    try {
      this.watchConfig();
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
      await writeJson(this.config, config, { spaces: 2 });
    }
  };

  watchingConfig = false;
  watchConfig() {
    if (this.watchingConfig) return;
    if (!existsSync(join(this.base, '.git'))) return;
    ensureFileSync(this.config);
    this.watchingConfig = true;
    watch(this.config, async (event) => {
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
      if (event === 'rename') {
        this.watchingConfig = false;
        this.watchConfig();
      }
    }).on('error', async () => {
      this.watchingConfig = false;
      this.watchConfig();
    });
  }
  constructor() {
    this.watchConfig();
  }
}
