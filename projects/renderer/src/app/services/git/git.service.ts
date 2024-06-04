import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GitService {

  constructor() { }
  getInfo = window.electron.git.info;
}
