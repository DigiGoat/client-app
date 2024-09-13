import { Component, ViewEncapsulation } from '@angular/core';
import { AppService } from '../../../services/app/app.service';
import { ConfigService } from '../../../services/config/config.service';
import { DialogService } from '../../../services/dialog/dialog.service';
import { GitService } from '../../../services/git/git.service';
import { RepoService } from '../../../services/repo/repo.service';
import { SuggestionService } from '../../../services/suggestion/suggestion.service';
import { WindowService } from '../../../services/window/window.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent {
  constructor(private windowService: WindowService, public configService: ConfigService, public suggestionService: SuggestionService, private dialogService: DialogService, private appService: AppService, private repoService: RepoService, private gitService: GitService) { }

  async openLogin() {
    await this.windowService.openLogin();
  }
  async changeFavicon() {
    const path = (await this.dialogService.showOpenDialog({ buttonLabel: 'Import Favicons', message: 'Select Your Favicon Package (Make Sure It Is Unzipped)', properties: ['openDirectory'] })).filePaths[0];
    if (path) {
      const contents = await this.appService.inspectDirectory(path);
      if (contents.includes('favicon.ico')) {
        await this.repoService.setFavicon(path);
        await this.gitService.commitFavicon();
      } else {
        await this.dialogService.showMessageBox({ type: 'warning', message: 'Invalid Favicon Package', detail: 'Please Ensure Your Are Using Real Favicon Generator and Try Again' });
      }
    }
  }
}
