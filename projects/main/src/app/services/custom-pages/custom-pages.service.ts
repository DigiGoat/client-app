import { BrowserWindow, app, ipcMain } from 'electron';
import { ensureFileSync, exists, existsSync, readJson, watch, writeJSON } from 'fs-extra';
import { join } from 'path';
import type { CustomPagesService as CustomPagesServiceType } from '../../../../../shared/services/custom-pages/custom-pages.service';
import type { BackendService } from '../../../../../shared/shared.module';

export class CustomPagesService {
  base = join(app.getPath('userData'), 'repo');
  customPages = join(this.base, 'src/assets/resources/custom-pages.json');
  async getCustomPages() {
    try {
      this.watchCustomPages();
      return await readJson(this.customPages);
    } catch (err) {
      console.warn('Error Reading Custom Pages:', err);
      return [];
    }
  }
  api: BackendService<CustomPagesServiceType> = {
    getCustomPages: async () => {
      return await this.getCustomPages();
    },
    setCustomPages: async (_event, does) => {
      await writeJSON(this.customPages, does, { spaces: 2 });
    },
  };
  watchingCustomPages = false;
  watchCustomPages() {
    if (this.watchingCustomPages || !existsSync(this.customPages)) return;
    if (!existsSync(join(this.base, '.git'))) return;
    ensureFileSync(this.customPages);
    this.watchingCustomPages = true;
    watch(this.customPages, async (event) => {
      try {
        const windows = BrowserWindow.getAllWindows();
        const newCustomPages = await this.getCustomPages();
        console.log('Custom Pages updated', event, newCustomPages);
        ipcMain.emit('customPages:customPagesChange', newCustomPages);
        windows.forEach(window => {
          if (!window.isDestroyed()) {
            window.webContents.send('customPages:customPagesChange', newCustomPages);
          }
        });
      } catch (err) {
        console.warn('Error Watching Custom Pages:', err);
      }
      if (event === 'rename') {
        this.watchingCustomPages = false;
        this.watchCustomPages();
      }
    }).on('error', async () => {
      this.watchingCustomPages = false;
      this.watchCustomPages();
    });
  }
  constructor() {
    this.watchCustomPages();
  }
}
