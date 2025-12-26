import { Component, type OnInit } from '@angular/core';
import type { Settings } from '../../../../../shared/services/settings/settings.service';
import { ConfigService } from '../../services/config/config.service';
import { DialogService } from '../../services/dialog/dialog.service';
import { DiffService } from '../../services/diff/diff.service';
import { GitService } from '../../services/git/git.service';
import { SettingsService } from '../../services/settings/settings.service';
import { WindowService } from '../../services/window/window.service';

@Component({
  selector: 'app-settings',
  standalone: false,
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  private _oldSettings: Settings = {};
  settings: Settings = {};
  constructor(private diffService: DiffService, private settingsService: SettingsService, private windowService: WindowService, private gitService: GitService, private dialogService: DialogService, private configService: ConfigService) { }
  get unsavedChangesDiff() {
    return this.diffService.diff(this._oldSettings, this.settings) as Record<string, string>;
  }
  isDirty(parameter: string) {
    return (parameter in this.unsavedChangesDiff);
  }
  get unsavedChanges() {
    return !!Object.keys(this.unsavedChangesDiff).length;
  }

  suggestedSettings: Required<Settings> = {
    analytics: {},
    firebase: {},
    url: '',
  };

  async ngOnInit() {
    const settings = await this.settingsService.get();
    this.settings = settings;
    this._oldSettings = structuredClone(settings);
    if (!this.settings.analytics) {
      this.settings.analytics = {};
      this.detectChanges();
    }
    if (!this.settings.firebase) {
      this.settings.firebase = {};
      this.detectChanges();
    }
    this.settingsService.onchange = (newSettings) => {
      this._oldSettings = newSettings;
      this.detectChanges();
    };
    this.windowService.onsave = async () => {
      if (this.unsavedChanges) {
        const action = (await this.dialogService.showMessageBox({ message: 'Unsaved Changes!', detail: 'Would you like to continue anyway?', buttons: ['Save Changes', 'Close Without Saving', 'Cancel'], defaultId: 0 })).response;
        switch (action) {
          case 0:
            await this.saveChanges();
            await this.windowService.close();
            break;
          case 1:
            await this.windowService.close(true);
            break;
        }
      }
    };

    this.suggestedSettings.analytics = this.configService.config['analytics'] as Analytics;
    this.suggestedSettings.firebase = this.configService.config['firebase'] as Firebase;

    const repoName = (await this.gitService.getSetup()).repo;
    this.suggestedSettings.firebase.projectId = repoName?.toLowerCase();
  }

  detectChanges() {
    this.windowService.setUnsavedChanges(this.unsavedChanges);
  }

  async saveChanges() {
    const diffMessage = this.diffService.commitMsg(this._oldSettings, this.settings);
    await window.electron.settings.set(this.settings);
    await this.windowService.setUnsavedChanges(false);
    await this.gitService.commitSettings(['Updated Settings', ...diffMessage]);
  }
  async discardChanges() {
    this.settings = this._oldSettings;
    await this.windowService.setUnsavedChanges(false);
  }
}

type Analytics = { gtag?: string, clarity?: string; };
type Firebase = { apiKey?: string, messagingSenderId?: string, appId?: string; };
