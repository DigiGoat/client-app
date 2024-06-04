import { ipcRenderer } from 'electron';
import type { GitService as GitServiceType } from '../../../../../../shared/services/git/git.service';

export const GitService: GitServiceType = {
  info: () => ipcRenderer.invoke('git:info')
};
