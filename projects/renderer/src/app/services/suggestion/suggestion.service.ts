import { ApplicationRef, Injectable } from '@angular/core';
import { ADGAService } from '../adga/adga.service';
import { DiffService } from '../diff/diff.service';

@Injectable({
  providedIn: 'root'
})
export class SuggestionService {
  private suggestAccount() {
    this.adgaService.getAccount().then(account => {
      this.name = this.diffService.titleCase(account.name ?? '');
      this.email = account.email ?? '';
      this.herdName = account.herdName ?? '';
      this.applicationRef.tick();
    });
  }
  constructor(private adgaService: ADGAService, private diffService: DiffService, private applicationRef: ApplicationRef) {
    this.suggestAccount();
    this.adgaService.onchange = () => this.suggestAccount();
  }
  name = '';
  email = '';

  private herdName = '';
  get homeTitle() {
    return this.diffService.titleCase((this.herdName.endsWith('FARM') || !this.herdName) ? this.herdName : `${this.herdName} FARM`);
  }
  get menubarTitle() {
    return this.homeTitle;
  }
  get tabTitle() {
    return this.diffService.titleCase(this.herdName.endsWith('FARM') ? this.herdName.slice(0, -5) : this.herdName);
  }
}
