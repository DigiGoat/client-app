import { ipcRenderer } from 'electron';
import { AppService as AppServiceType } from '../../../../../../shared/services/app/app.service';

export const AppService: AppServiceType = {
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  openVersion: (version) => ipcRenderer.invoke('app:openVersion', version),
  openLatest: () => ipcRenderer.invoke('app:openLatest'),
  authenticate: (message) => ipcRenderer.invoke('app:authenticate', message),
  inspectDirectory: path => ipcRenderer.invoke('app:inspectDirectory', path),
  openMarkdown: () => ipcRenderer.invoke('app:openMarkdown'),
  platform: process.platform,
};
