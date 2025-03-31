import { contextBridge } from 'electron';
import type { SharedModule } from '../../../../shared/shared.module';
import { ADGAService } from './services/adga/adga.service';
import { AppService } from './services/app/app.service';
import { ConfigService } from './services/config/config.service';
import { DialogService } from './services/dialog/dialog.service';
import { GitService } from './services/git/git.service';
import { GoatService } from './services/goat/goat.service';
import { ImageService } from './services/image/image.service';
import { PreviewService } from './services/preview/preview.service';
import { RepoService } from './services/repo/repo.service';
import { StdioService } from './services/stdio/stdio.service';
import { WindowService } from './services/window/window.service';

export class AppModule {
  api: SharedModule = {
    git: GitService,
    window: WindowService,
    dialog: DialogService,
    config: ConfigService,
    goat: GoatService,
    adga: ADGAService,
    repo: RepoService,
    app: AppService,
    image: ImageService,
    preview: PreviewService,
    stdio: StdioService
  };
  constructor() {
    contextBridge.exposeInMainWorld('electron', this.api);
  }
}
