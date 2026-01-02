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
  get title(): string {
    if (this.config['title']) {
      return this.config['title'] as string;
    } else if (this.config['homeTitle']) {
      return this.config['homeTitle'] as string;
    } else if (this.config['menubarTitle']) {
      return this.config['menubarTitle'] as string;
    }
    return '';
  }
  set title(title: string) {
    if ('homeTitle' in this._config) {
      delete this._config['homeTitle'];
    }
    if ('menubarTitle' in this._config) {
      delete this._config['menubarTitle'];
    }
    this.config = { title: title };
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
  get shortTitle(): string {
    if (this.config['shortTitle']) {
      return this.config['shortTitle'] as string;
    } else if (this.config['tabTitle']) {
      return this.config['tabTitle'] as string;
    }
    return '';
  }
  set shortTitle(shortTitle: string) {
    if ('tabTitle' in this._config) {
      delete this._config['tabTitle'];
    }
    this.config = { shortTitle: shortTitle };
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
type Socials = { facebook?: string; instagram?: string; threads?: string };
