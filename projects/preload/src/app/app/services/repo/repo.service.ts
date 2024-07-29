import { ipcRenderer } from 'electron';
import { RepoService as RepoServiceType } from '../../../../../../shared/services/repo/repo.service';

export const RepoService: RepoServiceType = {
  getVersion: () => ipcRenderer.invoke('repo:getVersion'),
  setFavicon: path => ipcRenderer.invoke('repo:setFavicon', path),
};
