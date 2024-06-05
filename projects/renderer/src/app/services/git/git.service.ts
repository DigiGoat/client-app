import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GitService {

  constructor() { }
  isRepo = window.electron.git.isRepo;
}
