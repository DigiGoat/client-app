import { ipcRenderer } from 'electron';
import type { WindowService as WindowServiceType } from '../../../../../../shared/services/window/window.service';

export const WindowService: WindowServiceType = {
  close: (ignoreChanges, ignoreClosable) => ipcRenderer.invoke('window:close', ignoreChanges, ignoreClosable),
  openSetup: () => ipcRenderer.invoke('window:openSetup'),
  openMain: () => ipcRenderer.invoke('window:openMain'),
  openGit: () => ipcRenderer.invoke('window:openGit'),
  openLogin: () => ipcRenderer.invoke('window:openLogin'),
  quit: (relaunch) => ipcRenderer.invoke('window:quit', relaunch),
  setUnsavedChanges: (unsavedChanges: boolean) => ipcRenderer.invoke('window:setUnsavedChanges', unsavedChanges),
  setClosable: (closable) => ipcRenderer.invoke('window:setClosable', closable),
  onsave: (callback) => ipcRenderer.on('window:onsave', () => callback()),
  openGoat: (type, goat) => ipcRenderer.invoke('window:openGoat', type, goat),
  setTitle: (title) => ipcRenderer.invoke('window:setTitle', title),
  openImages: (searchQueries) => ipcRenderer.invoke('window:openImages', searchQueries),
  refreshMain: () => ipcRenderer.invoke('window:refreshMain'),
  openImageOptimizer: () => ipcRenderer.invoke('window:openImageOptimizer')
};
