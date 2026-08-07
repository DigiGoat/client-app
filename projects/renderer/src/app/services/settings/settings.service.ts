import { inject, Injectable } from '@angular/core';
import { DiffService } from '../diff/diff.service';
import { GitService } from '../git/git.service';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private diffService = inject(DiffService);
  private gitService = inject(GitService);
  async get() {
    const settings = await window.electron.settings.get();
    return {
      ...SETTINGS,
      ...settings
    } as SETTINGS;
  }
  set = window.electron.settings.set;
  async saveSettings(oldSettings: SETTINGS, newSettings: SETTINGS) {
    const diffMessage = this.diffService.commitMsg(oldSettings, newSettings);
    await window.electron.settings.set(newSettings);
    await this.gitService.commitSettings(['Updated Settings', ...diffMessage]);
  }

  set onchange(callback: (settings: SETTINGS) => void) {
    window.electron.settings.onchange(newSettings => {
      callback({
        ...SETTINGS,
        ...newSettings
      } as SETTINGS);
    });
  }
}

export const SETTINGS = {
  analytics: {
    gtag: '',
    clarity: ''
  },
  firebase: {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
  },
  url: '',
  internationalImages: false
};
export type SETTINGS = typeof SETTINGS;