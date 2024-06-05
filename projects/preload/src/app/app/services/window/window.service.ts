import { ipcRenderer } from 'electron';
import type { WindowService as WindowServiceType } from '../../../../../../shared/services/window/window.service';

export const WindowService: WindowServiceType = {
  close: () => ipcRenderer.invoke('window:close')
};
