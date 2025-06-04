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
  openLogin = window.electron.window.openLogin;
  quit = window.electron.window.quit;
  setUnsavedChanges = window.electron.window.setUnsavedChanges;
  setClosable = window.electron.window.setClosable;
  set onsave(callback: () => void) {
    window.electron.window.onsave(callback);
  }
  openGoat = window.electron.window.openGoat;
  setTitle = window.electron.window.setTitle;
  openImages = window.electron.window.openImages;
  refreshMain = window.electron.window.refreshMain;
  openImageOptimizer = window.electron.window.openImageOptimizer;
}
