import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RepoService {

  constructor() { }
  getVersion = window.electron.repo.getVersion;
}
