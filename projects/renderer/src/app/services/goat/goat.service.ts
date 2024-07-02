import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import type { Goat } from '../../../../../shared/services/goat/goat.service';
import { DiffService } from '../diff/diff.service';
import { GitService } from '../git/git.service';

@Injectable({
  providedIn: 'root'
})
export class GoatService {

  constructor(private gitService: GitService, private diffService: DiffService) { }
  does = new Observable<Goat[]>(observer => {
    window.electron.goat.getDoes().then(does => observer.next(does));
    window.electron.goat.onDoesChange(does => observer.next(does));
  });
  async setDoe(index: number, doe: Goat) {
    const does = await window.electron.goat.getDoes();
    const diffMessage = this.diffService.commitMsg(does[index], doe);
    does[index] = doe;
    await window.electron.goat.setDoes(does);
    await this.gitService.commitDoes([`Updated ${doe.nickname ?? doe.name ?? doe.normalizeId}`, ...diffMessage]);
  }
  bucks = new Observable<Goat[]>(observer => {
    window.electron.goat.getBucks().then(bucks => observer.next(bucks));
    window.electron.goat.onBucksChange(bucks => observer.next(bucks));
  });
  async setBuck(index: number, buck: Goat) {
    const bucks = await window.electron.goat.getBucks();
    const diffMessage = this.diffService.commitMsg(bucks[index], buck);
    bucks[index] = buck;
    await window.electron.goat.setBucks(bucks);
    await this.gitService.commitBucks([`Updated ${buck.nickname ?? buck.name ?? buck.normalizeId}`, ...diffMessage]);
  }
}
