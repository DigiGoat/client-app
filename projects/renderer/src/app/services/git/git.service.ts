import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GitService {

  constructor() { }
  getInfo = window.electron.git.info;
  isRepo = window.electron.git.isRepo;
  init = window.electron.git.init;
}
