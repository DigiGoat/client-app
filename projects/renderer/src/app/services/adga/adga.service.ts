import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ADGAService {

  constructor() { }

  getAccount = window.electron.adga.getAccount;
  login = window.electron.adga.login;
  logout = window.electron.adga.logout;
  getOwnedGoats = window.electron.adga.getOwnedGoats;
}
