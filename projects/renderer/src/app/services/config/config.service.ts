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

  public readonly BLANK_CONFIG = {
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
  public async getConfig() {
    const newConfig = await window.electron.config.get();
    const config = {
      ...this.BLANK_CONFIG,
      /* Migrations */
      title: newConfig['homeTitle'] || newConfig['menubarTitle'],
      shortTitle: newConfig['tabTitle'],
      /* ----------- */
      ...newConfig
    };
    return config as typeof this.BLANK_CONFIG;
  };


  async saveConfig(oldConfig: typeof this.BLANK_CONFIG, newConfig: typeof this.BLANK_CONFIG) {
    const diffMessage = this.diffService.commitMsg(oldConfig, newConfig);
    await window.electron.config.set(newConfig);
    await this.gitService.commitConfig(['Updated Config', ...diffMessage]);
  }
  set onchange(callback: (config: typeof this.BLANK_CONFIG) => void) {
    window.electron.config.onchange(callback as (config: Config) => void);
  }
}
