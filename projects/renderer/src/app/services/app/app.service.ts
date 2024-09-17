import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor() { }
  getVersion = window.electron.app.getVersion;
  openVersion = window.electron.app.openVersion;
  openLatest = window.electron.app.openLatest;
  authenticate = window.electron.app.authenticate;
  inspectDirectory = window.electron.app.inspectDirectory;
  openMarkdown = window.electron.app.openMarkdown;
  platform = window.electron.app.platform;
}
