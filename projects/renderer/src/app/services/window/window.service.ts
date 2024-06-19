import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WindowService {

  constructor() { }
  close = window.electron.window.close;
  openSetup = window.electron.window.openSetup;
  openMain = window.electron.window.openMain;
  openGit = window.electron.window.openGit;
  quit = window.electron.window.quit;
  setUnsavedChanges = window.electron.window.setUnsavedChanges;
  set onsave(callback: () => void) {
    window.electron.window.onsave(callback);
  }
}
