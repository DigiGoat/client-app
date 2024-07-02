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
    const diffMessage = this.commitMsg(does[index], doe);
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
    const diffMessage = this.commitMsg(bucks[index], buck);
    bucks[index] = buck;
    await window.electron.goat.setBucks(bucks);
    await this.gitService.commitBucks([`Updated ${buck.nickname ?? buck.name ?? buck.normalizeId}`, ...diffMessage]);
  }

  /* -------------------- Message Parsing -------------------- */
  private commitMsg(original: Record<string, unknown>, current: Record<string, unknown>) {
    const diff = this.diffService.detailedDiff(original, current);
    const added = Object.keys(diff.added);
    const deleted = Object.keys(diff.deleted);
    const updated = Object.keys(diff.updated);
    const body: string[] = [];
    for (const addition of added) {
      if (typeof current[addition] !== 'object') {
        body.push(`Set ${this.prettyCase(addition)} To ${JSON.stringify(current[addition] as string)}`);
      } else {
        body.push(`Added ${this.prettyCase(addition)}`);
      }
    }

    for (const deletion of deleted) {
      body.push(`Deleted ${this.prettyCase(deletion)}`);
    }
    for (const update of updated) {
      if (typeof current[update] !== 'object') {
        if (current[update] && original[update]) {
          body.push(`Updated ${this.prettyCase(update)} From ${JSON.stringify(original[update] as string)} To ${JSON.stringify(current[update] as string)}`);
        } else if (current[update]) {
          body.push(`Set ${this.prettyCase(update)} To ${JSON.stringify(current[update] as string)}`);
        } else {
          body.push(`Deleted ${this.prettyCase(update)}`);
        }
      } else {
        body.push(`Updated ${this.prettyCase(update)}`);
      }
    }
    return body;
  }
  private prettyCase(key: string): string {
    return key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim();
  }
}
