import { Injectable } from '@angular/core';
import type { SimpleGitProgressEvent, VersionResult } from 'simple-git';
import { DialogService } from '../dialog/dialog.service';
import { WindowService } from '../window/window.service';

@Injectable({
  providedIn: 'root'
})
export class GitService {

  constructor(private dialogService: DialogService, private windowService: WindowService) {
    window.electron.git.onprogress(event => console.debug(event));
  }
  isRepo = window.electron.git.isRepo;
  setup = window.electron.git.setup;
  updateSetup = window.electron.git.updateSetup;
  setupDemo = window.electron.git.setupDemo;
  setupBlank = window.electron.git.setupBlank;
  version: () => Promise<VersionResult> = window.electron.git.version;
  set onprogress(callback: (event: SimpleGitProgressEvent) => void) {
    window.electron.git.onprogress(callback);
  }
  install = window.electron.git.install;
  trust = window.electron.git.trust;
  commitDoes = window.electron.git.commitDoes;
  commitBucks = window.electron.git.commitBucks;
  commitReferences = window.electron.git.commitReferences;
  commitConfig = window.electron.git.commitConfig;
  commitRelated = window.electron.git.commitRelated;
  commitKiddingSchedule = window.electron.git.commitKiddingSchedule;
  getPublishedDoes = window.electron.git.getPublishedDoes;
  push = window.electron.git.push;
  reset = window.electron.git.reset;
  getStatus = window.electron.git.getStatus;
  set onchange(callback: () => void) {
    window.electron.git.onchange(callback);
  }
  fetchUpdate = window.electron.git.fetchUpdate;
  readUpdate = window.electron.git.readUpdate;
  installUpdates = window.electron.git.installUpdates;
  async handleError(title: string, err: Error) {
    if (err.message.includes('Could not resolve host: github.com')) {
      await this.dialogService.showMessageBox({ message: title, type: 'warning', detail: 'It Appears That Your Internet Connection Is Offline' });
    } else if (err.message.includes('.git/\' not found')) {
      await this.dialogService.showMessageBox({ message: title, type: 'warning', detail: 'Repository Not Found' });
    } else if (err.message.includes('The requested URL returned error: 403')) {
      await this.dialogService.showMessageBox({ message: title, type: 'warning', detail: 'Invalid Token' });
    } else if (err.message.includes('invalid index-pack output') || err.message.includes('Couldn\'t connect to server')) {
      await this.dialogService.showMessageBox({ message: title, type: 'warning', detail: 'The Connection Timed Out. Please Verify Your Internet Connection & Try Again' });
    } else if (err.message.includes('a git process\nmay have crashed in this repository earlier')) {
      await this.dialogService.showMessageBox({ message: title, type: 'error', detail: 'Something Crashed When Saving Files Earlier. A Relaunch is Required', buttons: ['Exit and Relaunch'] });
      await this.windowService.quit(true);
    } else if (err.message.includes('Personal Access Token') || err.message.includes('could not read Password')) {
      await this.dialogService.showMessageBox({ message: title, type: 'warning', detail: 'Invalid Refresh Token, Please Contact Support For a New One' });
    } else {
      await this.dialogService.showMessageBox({ message: title, type: 'error', detail: err.message.split('fatal:').pop() });
    }
  }
  commitImages = window.electron.git.commitImages;
  commitFavicon = window.electron.git.commitFavicon;
  getSetup = window.electron.git.getSetup;
  getHistory = window.electron.git.getHistory;
}
