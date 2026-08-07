import { ChangeDetectionStrategy, Component, computed, inject, signal, type OnInit } from '@angular/core';
import { form, readonly } from '@angular/forms/signals';
import { captureException } from '@sentry/angular';
import { ConfigService } from '../../services/config/config.service';
import { DiffService } from '../../services/diff/diff.service';
import { GitService } from '../../services/git/git.service';
import { SETTINGS, SettingsService } from '../../services/settings/settings.service';
import { SaveableStrategy } from '../../strategies/saveable/saveable.strategy';

@Component({
  selector: 'app-settings',
  standalone: false,
  templateUrl: './settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './settings.component.scss'
})
export class SettingsComponent extends SaveableStrategy implements OnInit {
  private diffService = inject(DiffService);
  private settingsService = inject(SettingsService);
  private gitService = inject(GitService);
  private configService = inject(ConfigService);

  private savedSettings = signal(SETTINGS);
  private settingsModel = signal(SETTINGS);
  public settingsForm = form(this.settingsModel, form => {
    readonly(form, { when: () => this.loading() });
  }
  );
  private loading = signal(true);


  dirtyFields = computed(() => {
    return this.diffService.diff(this.savedSettings(), this.settingsForm().value()) as Partial<SETTINGS>;
  });
  unsavedChanges = computed(() => Object.keys(this.dirtyFields()).length > 0);
  suggestedSettings = signal(SETTINGS);

  async ngOnInit() {
    const settings = await this.settingsService.get();
    this.savedSettings.set(settings);
    this.settingsModel.set(settings);
    this.settingsForm().reset();
    this.loading.set(false);
    this.settingsService.onchange = (newSettings) => {
      this.loading.set(true);
      this.savedSettings.set(newSettings);
      this.loading.set(false);
    };

    //this.suggestedSettings.analytics = this.configService.config['analytics'] as Analytics ?? {};
    //this.suggestedSettings.firebase = this.configService.config['firebase'] as Firebase ?? {};

    const repoName = (await this.gitService.getSetup()).repo;
    if (repoName) {
      this.suggestedSettings.update(settings => ({ ...settings, firebase: { ...settings.firebase, projectId: repoName.toLowerCase() } }));
    }

    this.configService.getConfig().then(config => {
      this.suggestedSettings.update(settings => ({
        ...settings,
        analytics: {
          ...settings.analytics,
          ...(config as { analytics?: Analytics; })['analytics']
        },
        firebase: {
          ...settings.firebase,
          ...(config as { firebase?: Firebase; })['firebase']
        }
      }));
    });
  }

  override saveChanges = async () => {
    this.loading.set(true);
    try {
      await this.settingsService.saveSettings(this.savedSettings(), this.settingsForm().value());
    } catch (error) {
      captureException(error);
      alert('Error saving settings');
    } finally {
      this.loading.set(false);
    }
  };
}

interface Analytics { gtag?: string; clarity?: string; }
interface Firebase { apiKey?: string; messagingSenderId?: string; appId?: string; }
