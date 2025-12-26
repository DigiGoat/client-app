import { Injectable } from '@angular/core';
import type { Settings } from '../../../../../shared/services/settings/settings.service';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  get = window.electron.settings.get;
  set = window.electron.settings.set;

  set onchange(callback: (settings: Settings) => void) {
    window.electron.settings.onchange(callback);
  }
}
