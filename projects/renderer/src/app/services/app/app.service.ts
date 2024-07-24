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
}