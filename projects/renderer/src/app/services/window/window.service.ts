import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WindowService {

  constructor() { }
  close = window.electron.window.close;
  openSetup = window.electron.window.openSetup;
  openMain = window.electron.window.openMain;
}
