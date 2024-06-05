import { ipcRenderer } from 'electron';
import type { GitService as GitServiceType } from '../../../../../../shared/services/git/git.service';

export const GitService: GitServiceType = {
  isRepo: () => ipcRenderer.invoke('git:isRepo'),
};
