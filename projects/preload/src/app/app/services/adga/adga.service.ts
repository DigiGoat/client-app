import { ipcRenderer } from 'electron';
import { ADGAService as ADGAServiceType } from '../../../../../../shared/services/adga/adga.service';

export const ADGAService: ADGAServiceType = {
  getAccount: () => ipcRenderer.invoke('adga:getAccount'),
  login: (username, password, id) => ipcRenderer.invoke('adga:login', username, password, id),
  logout: () => ipcRenderer.invoke('adga:logout'),
  getOwnedGoats: () => ipcRenderer.invoke('adga:getOwnedGoats'),
  getGoat: (id) => ipcRenderer.invoke('adga:getGoat', id),
  onchange: (callback) => ipcRenderer.on('adga:change', () => callback()),
  lookupGoatsById: (normalizeId) => ipcRenderer.invoke('adga:lookupGoatsById', normalizeId),
  lookupGoatsByName: (name) => ipcRenderer.invoke('adga:lookupGoatsByName', name),
  blacklistOwnedGoat: (id) => ipcRenderer.invoke('adga:blacklistOwnedGoat', id),
};
