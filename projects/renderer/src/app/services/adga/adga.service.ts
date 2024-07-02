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

  private lowerCaseList = ['the'];
  private upperCaseList = ['sgch', 'dhrv', 'imax'];
  private titleCaseList = ['hot', 'me', 'old', 'in', 'day', 'van', 'fly', 'oh', 'joy', 'man', 'be', 'i\'m'];
  private parseCase(word: string) {
    if (this.lowerCaseList.includes(word)) {
      return word.toLowerCase();
    } else if (this.upperCaseList.includes(word)) {
      return word.toUpperCase();
    } else if (this.titleCaseList.includes(word)) {
      return word.replace(word[0], word[0].toUpperCase());
    } else if (word.length < 4) {
      return word.toUpperCase();
    } else {
      return word.replace(word[0], word[0].toUpperCase());
    }
  }
  titleCase(str: string) {
    str = str.toLowerCase();
    str = str.split(' ').map(str => str.split(',').map(_str => _str.split('/').map(__str => __str.split('-').map(word => this.parseCase(word)).join('-')).join('/')).join(',')).join(' ');
    return str;
  }
}
