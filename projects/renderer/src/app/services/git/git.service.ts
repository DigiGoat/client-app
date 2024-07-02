import { Injectable } from '@angular/core';
import type { SimpleGitProgressEvent, VersionResult } from 'simple-git';

@Injectable({
  providedIn: 'root'
})
export class GitService {

  constructor() { }
  isRepo = window.electron.git.isRepo;
  setup = window.electron.git.setup;
  updateSetup = window.electron.git.updateSetup;
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
}
