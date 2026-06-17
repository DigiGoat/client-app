import { Injectable, inject } from '@angular/core';
import type { Config } from '../../../../../shared/services/config/config.service';
import { DiffService } from '../diff/diff.service';
import { GitService } from '../git/git.service';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private diffService = inject(DiffService);
  private gitService = inject(GitService);

  public async getConfig() {
    const newConfig = await window.electron.config.get();
    const config = {
      ...CONFIG,
      /* Migrations */
      title: newConfig['homeTitle'] || newConfig['menubarTitle'],
      shortTitle: newConfig['tabTitle'],
      /* ----------- */
      ...newConfig
    };
    return config as typeof CONFIG;
  };


  async saveConfig(oldConfig: typeof CONFIG, newConfig: typeof CONFIG) {
    const diffMessage = this.diffService.commitMsg(oldConfig, newConfig);
    await window.electron.config.set(newConfig);
    await this.gitService.commitConfig(['Updated Config', ...diffMessage]);
  }
  set onchange(callback: (config: typeof CONFIG) => void) {
    window.electron.config.onchange(callback as (config: Config) => void);
  }
}

export const CONFIG = {
  title: '',
  shortTitle: '',
  owner: '',
  email: '',
  hideEmail: false,
  homeDescription: '',
  colors: {
    background: '',
    main: '',
    secondary: '',
    tertiary: '',
    quaternary: '',
    light: {
      main: '',
      secondary: '',
      tertiary: '',
      quaternary: ''
    }
  },
  kiddingSchedule: false,
  kiddingScheduleDescription: '',
  references: false,
  forSale: false,
  saleTerms: '',
  socials: {
    facebook: '',
    instagram: '',
    threads: ''
  },
  contactForm: false
};
