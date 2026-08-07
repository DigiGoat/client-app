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
    return this.parseConfig(await window.electron.config.get());
  };


  async saveConfig(oldConfig: CONFIG, newConfig: CONFIG) {
    const diffMessage = this.diffService.commitMsg(oldConfig, newConfig);
    await window.electron.config.set(newConfig);
    await this.gitService.commitConfig(['Updated Config', ...diffMessage]);
  }
  set onchange(callback: (config: CONFIG) => void) {
    window.electron.config.onchange(config => callback(this.parseConfig(config)));
  }

  public parseConfig(config: Config): CONFIG {
    return {
      ...CONFIG,
      /* Migrations */
      title: config['homeTitle'] || config['menubarTitle'] || '',
      shortTitle: config['tabTitle'] || '',
      /* ----------- */
      ...config
    } as CONFIG;
  }
}

export type CONFIG = typeof CONFIG;
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
