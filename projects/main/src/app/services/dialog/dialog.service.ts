import { BrowserWindow, dialog } from 'electron';
import { DialogService as DialogServiceType } from '../../../../../shared/services/dialog/dialog.service';
import { BackendService } from '../../../../../shared/shared.module';
export class DialogService {
  api: BackendService<DialogServiceType> = {
    showOpenDialog: async (event, options) => {
      return await dialog.showOpenDialog(BrowserWindow.fromWebContents(event.sender), options);
    },
    showSaveDialog: async (event, options) => {
      return await dialog.showSaveDialog(BrowserWindow.fromWebContents(event.sender), options);
    },
    showMessageBox: async (event, options) => {
      return await dialog.showMessageBox(BrowserWindow.fromWebContents(event.sender), options);
    }
  };
}
