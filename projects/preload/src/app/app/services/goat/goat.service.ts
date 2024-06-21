import { ipcRenderer } from 'electron';
import type { GoatService as GoatServiceType } from '../../../../../../shared/services/goat/goat.service';

export const GoatService: GoatServiceType = {
  getDoes: () => ipcRenderer.invoke('goat:getDoes'),
  setDoes: (does) => ipcRenderer.invoke('goat:setDoes', does),
  onDoesChange: (callback) => ipcRenderer.on('goat:doesChange', (_event, does) => callback(does))
};
