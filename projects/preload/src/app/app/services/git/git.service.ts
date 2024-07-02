import { ipcRenderer } from 'electron';
import type { GitService as GitServiceType } from '../../../../../../shared/services/git/git.service';

export const GitService: GitServiceType = {
  isRepo: () => ipcRenderer.invoke('git:isRepo'),
  setup: (repo: string, name, email, token?: string) => ipcRenderer.invoke('git:setup', repo, name, email, token),
  updateSetup: (repo: string, name, email, token?: string) => ipcRenderer.invoke('git:updateSetup', repo, name, email, token),
  onprogress: (callback) => ipcRenderer.on('git:progress', (_event, progress) => callback(progress)),
  version: () => ipcRenderer.invoke('git:version'),
  install: () => ipcRenderer.invoke('git:install'),
  getPublishedDoes: () => ipcRenderer.invoke('git:getPublishedDoes')
};
