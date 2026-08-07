import { ChangeDetectionStrategy, Component, computed, inject, signal, ViewEncapsulation, type OnInit } from '@angular/core';
import { disabled, form, readonly } from '@angular/forms/signals';
import { AppService } from '../../../services/app/app.service';
import { CONFIG, ConfigService } from '../../../services/config/config.service';
import { DialogService } from '../../../services/dialog/dialog.service';
import { DiffService } from '../../../services/diff/diff.service';
import { GitService } from '../../../services/git/git.service';
import { RepoService } from '../../../services/repo/repo.service';
import { SuggestionService } from '../../../services/suggestion/suggestion.service';
import { WindowService } from '../../../services/window/window.service';
import { SaveableStrategy } from '../../../strategies/saveable/saveable.strategy';
import { captureException } from '@sentry/angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class HomeComponent extends SaveableStrategy implements OnInit {
  private windowService = inject(WindowService);
  configService = inject(ConfigService);
  suggestionService = inject(SuggestionService);
  private dialogService = inject(DialogService);
  private appService = inject(AppService);
  private repoService = inject(RepoService);
  private gitService = inject(GitService);
  private diffService = inject(DiffService);

  private loading = signal(true);
  private savedConfig = signal(CONFIG);
  private configModel = signal(CONFIG);
  public configForm = form(this.configModel, form => {
    readonly(form, { when: () => this.loading() });
    disabled(form.contactForm, { when: ({ valueOf }) => !valueOf(form.email) || (!valueOf(form.title) || !valueOf(form.shortTitle)) });
  });

  async ngOnInit() {
    this.savedConfig.set(await this.configService.getConfig());
    this.configModel.set(this.savedConfig());
    this.configForm().reset();
    this.loading.set(false);

    this.configService.onchange = (newConfig) => {
      this.savedConfig.set(newConfig);
      this.configForm().reset();
    };
  }

  override unsavedChanges = computed(() => Object.keys(this.dirtyFields()).length > 0);
  override saveChanges = async () => {
    this.loading.set(true);
    try {
      await this.configService.saveConfig(this.savedConfig(), this.configForm().value());
    } catch (error) {
      captureException(error);
      alert('Error saving config');
    } finally {
      this.loading.set(false);
    }
  };

  dirtyFields = computed(() => {
    return this.diffService.diff(this.savedConfig(), this.configForm().value()) as Partial<CONFIG>;
  });

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
