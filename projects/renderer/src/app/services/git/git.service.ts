import { Injectable } from '@angular/core';
import type { SimpleGitProgressEvent } from 'simple-git';

@Injectable({
  providedIn: 'root'
})
export class GitService {

  constructor() { }
  isRepo = window.electron.git.isRepo;
  setup = window.electron.git.setup;
  set onprogress(callback: (event: SimpleGitProgressEvent) => void) {
    window.electron.git.onprogress(callback);
  }
}
