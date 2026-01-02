import { BrowserWindow, app } from 'electron';
import { ensureFileSync, existsSync, readJson, watch, writeJson } from 'fs-extra';
import { join } from 'path';
import type { SettingsService as SettingsServiceType } from '../../../../../shared/services/settings/settings.service';
import type { BackendService } from '../../../../../shared/shared.module';

export class SettingsService {
  base = join(app.getPath('userData'), 'repo');
  settings = join(this.base, 'src/assets/resources/settings.json');

  async getSettings() {
    try {
      this.watchSettings();
      return await readJson(this.settings);
    } catch (err) {
      console.warn('Error Reading Settings:', err);
      return {};
    }
  }

  api: BackendService<SettingsServiceType> = {
    get: async () => {
      return await this.getSettings();
    },
    set: async (_event, settings) => {
      ensureFileSync(this.settings);
      await writeJson(this.settings, settings, { spaces: 2 });
    }
  };

  watchingSettings = false;
  watchSettings() {
    if (this.watchingSettings || !existsSync(this.settings)) return;
    if (!existsSync(join(this.base, '.git'))) return;
    ensureFileSync(this.settings);
    this.watchingSettings = true;
    watch(this.settings, async (event) => {
      try {
        const windows = BrowserWindow.getAllWindows();
        const newSettings = await this.getSettings();
        console.log('Settings updated', newSettings);
        windows.forEach(window => {
          if (!window.isDestroyed()) {
            window.webContents.send('settings:change', newSettings);
          }
        });
      } catch (err) {
        console.warn('Error Updating Settings:', err);
      }
      if (event === 'rename') {
        this.watchingSettings = false;
        this.watchSettings();
      }
    }).on('error', async () => {
      this.watchingSettings = false;
      this.watchSettings();
    });
  }

  constructor() {
    this.watchSettings();
  }
}
