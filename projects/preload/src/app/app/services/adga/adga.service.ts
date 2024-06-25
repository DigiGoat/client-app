import { ipcRenderer } from 'electron';
import { ADGAService as ADGAServiceType } from '../../../../../../shared/services/adga/adga.service';

export const ADGAService: ADGAServiceType = {
  getAccount: () => ipcRenderer.invoke('adga:getAccount'),
  login: (username, password, id) => ipcRenderer.invoke('adga:login', username, password, id),
  logout: () => ipcRenderer.invoke('adga:logout'),
  getOwnedGoats: () => ipcRenderer.invoke('adga:getOwnedGoats')
};
