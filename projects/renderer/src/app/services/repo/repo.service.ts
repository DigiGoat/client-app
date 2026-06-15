import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RepoService {

  getVersion = window.electron.repo.getVersion;
  setFavicon = window.electron.repo.setFavicon;
}
