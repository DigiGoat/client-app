import { Injectable } from '@angular/core';
import type { Config } from '../../../../../shared/services/config/config.service';
import { DialogService } from '../dialog/dialog.service';
import { DiffService } from '../diff/diff.service';
import { GitService } from '../git/git.service';
import { WindowService } from '../window/window.service';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private _oldConfig: Config = {};
  private _config: Config = {};
  get unsavedChangesDiff() {
    return this.diffService.diff(this._oldConfig, this.config) as Record<string, string>;
  }
  isDirty(parameter: string) {
    return (parameter in this.unsavedChangesDiff);
  }
  get unsavedChanges() {
    return !!Object.keys(this.unsavedChangesDiff).length;
  }
  set config(config: Partial<Config>) {
    Object.assign(this._config, config);
    this.windowService.setUnsavedChanges(this.unsavedChanges);
  }
  get config(): Config {
    return this._config;
  }
  async saveChanges() {
    const diffMessage = this.diffService.commitMsg(this._oldConfig, this.config);
    await window.electron.config.set(this._config);
    await this.windowService.setUnsavedChanges(false);
    await this.gitService.commitConfig(['Updated Config', ...diffMessage]);
  }
  async discardChanges() {
    this._config = {};
    this.config = this._oldConfig;
    await this.windowService.setUnsavedChanges(false);
  }
  constructor(private diffService: DiffService, private windowService: WindowService, private dialogService: DialogService, private gitService: GitService) {
    this.windowService.setUnsavedChanges(false);
    window.electron.config.get().then(config => {
      this._oldConfig = config;
      this.config = config;
    });
    window.electron.config.onchange(config => {
      this._oldConfig = config;
      this.windowService.setUnsavedChanges(this.unsavedChanges);
      console.log('Config Updated', this._oldConfig, this.unsavedChanges);
    });
    windowService.onsave = async () => {
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
  }
  get homeTitle(): string {
    if (this.config['homeTitle']) {
      return this.config['homeTitle'] as string;
    }
    return '';
  }
  set homeTitle(homeTitle: string) {
    this.config = { homeTitle: homeTitle };
  }
  get owner(): string {
    if (this.config['owner']) {
      return this.config['owner'] as string;
    }
    return '';
  }
  set owner(owner: string) {
    this.config = { owner: owner };
  }
  get email(): string {
    if (this.config['email']) {
      return this.config['email'] as string;
    }
    return '';
  }
  set email(email: string) {
    this.config = { email: email };
  }
  get homeDescription(): string {
    if (this.config['homeDescription']) {
      return this.config['homeDescription'] as string;
    }
    return '';
  }
  set homeDescription(homeDescription: string) {
    this.config = { homeDescription: homeDescription };
  }
  get menubarTitle(): string {
    if (this.config['menubarTitle']) {
      return this.config['menubarTitle'] as string;
    }
    return '';
  }
  set menubarTitle(menubarTitle: string) {
    this.config = { menubarTitle: menubarTitle };
  }
  get tabTitle(): string {
    if (this.config['tabTitle']) {
      return this.config['tabTitle'] as string;
    }
    return '';
  }
  set tabTitle(tabTitle: string) {
    this.config = { tabTitle: tabTitle };
  }
  get link(): string {
    if (this.config['link']) {
      return `${this.config['link']}${(this.config['link'] as string).endsWith('/') ? '' : '/'}`;
    }
    return '';
  }
  get analytics(): Analytics {
    if (this.config['analytics']) {
      return this.config['analytics'] as Analytics;
    }
    return {};
  }
  set analytics(analytics: Analytics) {
    this.config = {
      analytics: {
        ...(typeof this.config['analytics'] === 'object' ? this.config['analytics'] : {}),
        ...analytics
      }
    };
  }
  get colors(): ColorScheme {
    if (this.config['colors']) {
      return this.config['colors'] as ColorScheme;
    }
    return {};
  }
  set colors(colors: ColorScheme) {
    if (this.config['colors'] && typeof (this.config['colors'] as Record<string, Record<string, string>>)['light'] === 'object' || colors.light) {
      this.config = {
        colors: {
          ...(typeof this.config['colors'] === 'object' ? this.config['colors'] : {}),
          ...colors,
          light: {
            ...(typeof (this.config['colors'] as Record<string, Record<string, string>>)['light'] === 'object' ? (this.config['colors'] as Record<string, Record<string, string>>)['light'] : {}),
            ...colors.light
          }
        }
      };
    } else {
      this.config = {
        colors: colors
      };
    }
  }
  get kiddingSchedule(): boolean {
    return this.config['kiddingSchedule'] as boolean ?? false;
  }
  set kiddingSchedule(kiddingSchedule: boolean) {
    this.config = { kiddingSchedule: kiddingSchedule };
  }
  get kiddingScheduleDescription(): string {
    if (this.config['kiddingScheduleDescription']) {
      return this.config['kiddingScheduleDescription'] as string;
    }
    return '';
  }
  set kiddingScheduleDescription(kiddingScheduleDescription: string) {
    this.config = { kiddingScheduleDescription: kiddingScheduleDescription };
  }
  get references(): boolean {
    return this.config['references'] as boolean ?? false;
  }
  set references(references: boolean) {
    this.config = { references: references };
  }
  get forSale(): boolean {
    return this.config['forSale'] as boolean ?? false;
  }
  set forSale(forSale: boolean) {
    this.config = { forSale: forSale };
  }
  get saleTerms(): string {
    if (this.config['saleTerms']) {
      return this.config['saleTerms'] as string;
    }
    return '';
  }
  set saleTerms(saleTerms: string) {
    this.config = { saleTerms: saleTerms };
  }
  get socials(): Socials {
    if (this.config['socials']) {
      return this.config['socials'] as Socials;
    }
    return {};
  }
  set socials(socials: Socials) {
    this.config = {
      socials: {
        ...(typeof this.config['socials'] === 'object' ? this.config['socials'] : {}),
        ...socials
      }
    };
  }
}


type Analytics = { gtag?: string, clarity?: string; };
type ColorScheme = {
  background?: 'wood';
  main?: string;
  secondary?: string;
  tertiary?: string;
  quaternary?: string;
  light?: {
    main?: string;
    secondary?: string;
    tertiary?: string;
    quaternary?: string;
  };
};
type Socials = { facebook?: string, instagram?: string, threads?: string; };
