import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor() { }

  showOpenDialog = window.electron.dialog.showOpenDialog;
  showSaveDialog = window.electron.dialog.showSaveDialog;
  showMessageBox = window.electron.dialog.showMessageBox;
}
