import { ipcRenderer } from 'electron';
import type { WindowService as WindowServiceType } from '../../../../../../shared/services/window/window.service';

export const WindowService: WindowServiceType = {
  close: () => ipcRenderer.invoke('window:close'),
  openSetup: () => ipcRenderer.invoke('window:openSetup'),
  openMain: () => ipcRenderer.invoke('window:openMain'),
  openGit: () => ipcRenderer.invoke('window:openGit'),
  quit: () => ipcRenderer.invoke('window:quit')
};
