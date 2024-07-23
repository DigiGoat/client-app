import { ipcRenderer } from 'electron';
import { AppService as AppServiceType } from '../../../../../../shared/services/app/app.service';

export const AppService: AppServiceType = {
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  openVersion: (version) => ipcRenderer.invoke('app:openVersion', version),
  openLatest: () => ipcRenderer.invoke('app:openLatest')
};
