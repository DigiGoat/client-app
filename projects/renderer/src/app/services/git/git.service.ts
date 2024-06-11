import { Injectable } from '@angular/core';
import type { SimpleGitProgressEvent, VersionResult } from 'simple-git';

@Injectable({
  providedIn: 'root'
})
export class GitService {

  constructor() { }
  isRepo = window.electron.git.isRepo;
  setup = window.electron.git.setup;
  version: () => Promise<VersionResult> = window.electron.git.version;
  set onprogress(callback: (event: SimpleGitProgressEvent) => void) {
    window.electron.git.onprogress(callback);
  }
  install = window.electron.git.install;
}
