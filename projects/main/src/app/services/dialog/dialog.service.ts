import { BrowserWindow, dialog, type IpcMainInvokeEvent, type MessageBoxOptions, type OpenDialogOptions, type SaveDialogOptions } from 'electron';
import { DialogService as DialogServiceType } from '../../../../../shared/services/dialog/dialog.service.d';
import { BackendService } from '../../../../../shared/shared.module.d';
export const DialogService: BackendService<DialogServiceType> = {
  showOpenDialog: async (event: IpcMainInvokeEvent, options: OpenDialogOptions) => {
    return await dialog.showOpenDialog(BrowserWindow.fromWebContents(event.sender), options);
  },
  showSaveDialog: async (event: IpcMainInvokeEvent, options: SaveDialogOptions) => {
    return await dialog.showSaveDialog(BrowserWindow.fromWebContents(event.sender), options);
  },
  showMessageBox: async (event: IpcMainInvokeEvent, options: MessageBoxOptions) => {
    return await dialog.showMessageBox(BrowserWindow.fromWebContents(event.sender), options);
  }
};
