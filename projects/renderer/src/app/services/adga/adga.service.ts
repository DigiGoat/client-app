import { Injectable } from '@angular/core';
import { DialogService } from '../dialog/dialog.service';
import { WindowService } from '../window/window.service';

@Injectable({
  providedIn: 'root'
})
export class ADGAService {

  constructor(private dialogService: DialogService, private windowService: WindowService) { }

  async handleError(err: Error, title: string) {
    if (err.message.includes('No ADGA Account Found!')) {
      const action = await this.dialogService.showMessageBox({ message: title, detail: 'Please login to use this feature', buttons: ['Login', 'Cancel'], type: 'warning' });
      if (action.response === 0) {
        await this.windowService.openLogin();
      }
    } else if (err.message.includes('Invalid Login ID Or Password')) {
      const action = await this.dialogService.showMessageBox({ message: title, detail: 'Invalid Login Credentials. Please Log Back In & Try Again', buttons: ['Login', 'Cancel'], type: 'warning' });
      if (action.response === 0) {
        await this.windowService.openLogin();
      }

    } else {
      await this.dialogService.showMessageBox({ message: title, detail: err.message, type: 'error' });
    }
  }

  getAccount = window.electron.adga.getAccount;
  login = window.electron.adga.login;
  logout = window.electron.adga.logout;
  getOwnedGoats = window.electron.adga.getOwnedGoats;
  getGoat = window.electron.adga.getGoat;
}
