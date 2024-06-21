import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import type { Goat } from '../../../../../shared/services/goat/goat.service';

@Injectable({
  providedIn: 'root'
})
export class GoatService {

  constructor() { }
  does = new Observable<Goat[]>(observer => {
    window.electron.goat.getDoes().then(does => observer.next(does));
    window.electron.goat.onDoesChange(does => observer.next(does));
  });
  async setDoe(index: number, doe: Goat) {
    const does = await window.electron.goat.getDoes();
    does[index] = doe;
    await window.electron.goat.setDoes(does);
  }
  bucks = new Observable<Goat[]>(observer => {
    window.electron.goat.getBucks().then(bucks => observer.next(bucks));
    window.electron.goat.onBucksChange(bucks => observer.next(bucks));
  });
  async setBuck(index: number, buck: Goat) {
    const bucks = await window.electron.goat.getBucks();
    bucks[index] = buck;
    await window.electron.goat.setBucks(bucks);
  }
}
