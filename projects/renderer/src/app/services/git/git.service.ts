import { Injectable } from '@angular/core';
import type { SimpleGitProgressEvent, VersionResult } from 'simple-git';
import { DialogService } from '../dialog/dialog.service';

@Injectable({
  providedIn: 'root'
})
export class GitService {

  constructor(private dialogService: DialogService) { }
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
  commitDoes = window.electron.git.commitDoes;
  commitBucks = window.electron.git.commitBucks;
  commitConfig = window.electron.git.commitConfig;
  getPublishedDoes = window.electron.git.getPublishedDoes;
  push = window.electron.git.push;
  reset = window.electron.git.reset;
  getStatus = window.electron.git.getStatus;
  set onchange(callback: () => void) {
    window.electron.git.onchange(callback);
  }
  async handleError(title: string, err: Error) {
    if (err.message.includes('Could not resolve host: github.com')) {
      await this.dialogService.showMessageBox({ message: 'Clone Failed!', type: 'warning', detail: 'It Appears That Your Internet Connection Is Offline' });
    } else if (err.message.includes('.git/\' not found')) {
      await this.dialogService.showMessageBox({ message: 'Clone Failed!', type: 'warning', detail: 'Repository Not Found' });
    } else if (err.message.includes('The requested URL returned error: 403')) {
      await this.dialogService.showMessageBox({ message: 'Clone Failed!', type: 'warning', detail: 'Invalid Token' });
    } else if (err.message.includes('invalid index-pack output') || err.message.includes('Couldn\'t connect to server')) {
      await this.dialogService.showMessageBox({ message: 'Clone Failed!', type: 'warning', detail: 'The Connection Timed Out. Please Verify Your Internet Connection & Try Again' });
    } else {
      await this.dialogService.showMessageBox({ message: 'Clone Failed!', type: 'error', detail: err.message.split('fatal:').pop() });
    }
  }
}
