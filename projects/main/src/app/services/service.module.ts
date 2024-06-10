import { ipcMain } from 'electron';
import { DialogService } from './dialog/dialog.service';

export class ServiceModule {
  api/*: BackendSharedModule*/ = {
    dialog: DialogService
  };
  constructor() {
    //@ts-expect-error Typescript does not like indexing a object with a string
    Object.keys(this.api).forEach(service => Object.keys(this.api[service]).forEach(key => ipcMain.handle(`${service}:${key}`, this.api[service][key])));
  }
}
