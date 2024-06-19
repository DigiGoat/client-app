import { ipcRenderer } from 'electron';
import { ConfigService as ConfigServiceType } from '../../../../../../shared/services/config/config.service';

export const ConfigService: ConfigServiceType = {
  get: () => ipcRenderer.invoke('config:get'),
  set: (config) => ipcRenderer.invoke('config:set', config),
  onchange: (callback) => ipcRenderer.on('config:change', (_event, config) => callback(config))
};
