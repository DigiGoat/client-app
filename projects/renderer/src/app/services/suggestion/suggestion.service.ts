import { ApplicationRef, Injectable, inject } from '@angular/core';
import { ADGAService } from '../adga/adga.service';
import { DiffService } from '../diff/diff.service';

@Injectable({
  providedIn: 'root'
})
export class SuggestionService {
  private adgaService = inject(ADGAService);
  private diffService = inject(DiffService);
  private applicationRef = inject(ApplicationRef);

  private suggestAccount() {
    this.adgaService.getAccount().then(account => {
      this.name = this.diffService.titleCase(account?.name ?? '');
      this.email = account?.email ?? '';
      this.herdName = account?.herdName ?? '';
      this.applicationRef.tick();
    });
  }
  constructor() {
    this.suggestAccount();
    this.adgaService.onchange = () => this.suggestAccount();
  }
  name = '';
  email = '';

  private herdName = '';
  get title() {
    return this.diffService.titleCase((this.herdName?.endsWith('FARM') || !this.herdName) ? this.herdName : `${this.herdName} FARM`);
  }
  get shortTitle() {
    return this.diffService.titleCase(this.herdName?.endsWith('FARM') ? this.herdName.slice(0, -5) : this.herdName);
  }
}
