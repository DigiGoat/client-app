import { ipcRenderer } from 'electron';
import type { DialogService as DialogServiceType } from '../../../../../../shared/services/dialog/dialog.service';

export const DialogService: DialogServiceType = {
  showOpenDialog: (options) => ipcRenderer.invoke('dialog:showOpenDialog', options),
  showSaveDialog: (options) => ipcRenderer.invoke('dialog:showSaveDialog', options),
  showMessageBox: (options) => ipcRenderer.invoke('dialog:showMessageBox', options)
};
