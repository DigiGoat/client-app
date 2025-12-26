import { ipcRenderer } from 'electron';
import type { SettingsService as SettingsServiceType } from '../../../../../../shared/services/settings/settings.service';

export const SettingsService: SettingsServiceType = {
  get: () => ipcRenderer.invoke('settings:get'),
  set: (settings) => ipcRenderer.invoke('settings:set', settings),
  onchange: (callback) => ipcRenderer.on('settings:change', (_event, settings) => callback(settings))
};
