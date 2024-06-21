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
}
