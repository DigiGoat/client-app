import { ipcRenderer } from 'electron';
import type { GitService as GitServiceType } from '../../../../../../shared/services/git/git.service';

export const GitService: GitServiceType = {
  isRepo: () => ipcRenderer.invoke('git:isRepo'),
  setup: (repo: string, name, email, token?: string) => ipcRenderer.invoke('git:setup', repo, name, email, token),
  updateSetup: (repo: string, name, email, token?: string) => ipcRenderer.invoke('git:updateSetup', repo, name, email, token),
  setupDemo: () => ipcRenderer.invoke('git:setupDemo'),
  setupBlank: () => ipcRenderer.invoke('git:setupBlank'),
  onprogress: (callback) => ipcRenderer.on('git:progress', (_event, progress) => callback(progress)),
  version: () => ipcRenderer.invoke('git:version'),
  install: () => ipcRenderer.invoke('git:install'),
  getPublishedDoes: () => ipcRenderer.invoke('git:getPublishedDoes'),
  commitDoes: (message) => ipcRenderer.invoke('git:commitDoes', message),
  commitBucks: (message) => ipcRenderer.invoke('git:commitBucks', message),
  commitConfig: (message) => ipcRenderer.invoke('git:commitConfig', message),
  push: () => ipcRenderer.invoke('git:push'),
  reset: () => ipcRenderer.invoke('git:reset'),
  getStatus: () => ipcRenderer.invoke('git:getStatus'),
  onchange: (callback) => ipcRenderer.on('git:change', () => callback()),
  fetchUpdate: () => ipcRenderer.invoke('git:fetchUpdate'),
  readUpdate: () => ipcRenderer.invoke('git:readUpdate'),
  installUpdates: () => ipcRenderer.invoke('git:installUpdates'),
  commitImages: (paths, message) => ipcRenderer.invoke('git:commitImages', paths, message),
  commitFavicon: () => ipcRenderer.invoke('git:commitFavicon'),
  getSetup: () => ipcRenderer.invoke('git:getSetup'),
};
