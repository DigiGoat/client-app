import { startSpan } from '@sentry/electron/main';
import { ipcMain } from 'electron';
import type { BackendSharedModule } from '../../../../shared/shared.module';
import { ADGAService } from './adga/adga.service';
import { AppService } from './app/app.service';
import { ConfigService } from './config/config.service';
import { CustomPagesService } from './custom-pages/custom-pages.service';
import { DialogService } from './dialog/dialog.service';
import { GitService } from './git/git.service';
import { GoatService } from './goat/goat.service';
import { ImageService } from './image/image.service';
import { PreviewService } from './preview/preview.service';
import { RepoService } from './repo/repo.service';
import { SettingsService } from './settings/settings.service';
import { StdioService } from './stdio/stdio.service';
import { WindowService } from './window/window.service';

export class ServiceModule {
  api: BackendSharedModule = {
    dialog: new DialogService().api,
    git: new GitService().api,
    window: new WindowService().api,
    config: new ConfigService().api,
    settings: new SettingsService().api,
    goat: new GoatService().api,
    adga: new ADGAService().api,
    repo: new RepoService().api,
    app: new AppService().api,
    image: new ImageService().api,
    preview: new PreviewService().api,
    stdio: new StdioService().api,
    customPages: new CustomPagesService().api,
  };
  constructor() {
    // `SharedModule` typing is primarily for compile-time contracts; at runtime this is a
    // nested object of invoke-able functions. We cast here to avoid TS reducing the
    // indexed access type to `never`.
    const api = this.api as unknown as Record<string, Record<string, (...args: unknown[]) => unknown>>;

    Object.keys(api).forEach(service => {
      Object.keys(api[service]).forEach(key => {
        ipcMain.handle(`${service}:${key}`, (...allArgs) =>
          startSpan({ name: key, op: `ipc.${service}` }, () => api[service][key](...allArgs)),
        );
      });
    });
  }
}
