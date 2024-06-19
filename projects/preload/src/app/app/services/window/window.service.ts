import { ipcRenderer } from 'electron';
import type { WindowService as WindowServiceType } from '../../../../../../shared/services/window/window.service';

export const WindowService: WindowServiceType = {
  close: (ignoreChanges) => ipcRenderer.invoke('window:close', ignoreChanges),
  openSetup: () => ipcRenderer.invoke('window:openSetup'),
  openMain: () => ipcRenderer.invoke('window:openMain'),
  openGit: () => ipcRenderer.invoke('window:openGit'),
  quit: () => ipcRenderer.invoke('window:quit'),
  setUnsavedChanges: (unsavedChanges: boolean) => ipcRenderer.invoke('window:setUnsavedChanges', unsavedChanges),
  onsave: (callback) => ipcRenderer.on('window:onsave', () => callback())
};
