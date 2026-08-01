import { ApplicationRef, Injectable, computed, inject, signal } from '@angular/core';
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
      this.name.set(this.diffService.titleCase(account?.name ?? ''));
      this.email.set(account?.email ?? '');
      this.herdName.set(account?.herdName ?? '');
      this.applicationRef.tick();
    });
  }
  constructor() {
    this.suggestAccount();
    this.adgaService.onchange = () => this.suggestAccount();
  }
  name = signal('');
  email = signal('');

  private herdName = signal('');

  title = computed(() => this.diffService.titleCase((this.herdName()?.endsWith('FARM') || !this.herdName()) ? this.herdName() : `${this.herdName()} FARM`));
  shortTitle = computed(() => this.diffService.titleCase(this.herdName()?.endsWith('FARM') ? this.herdName().slice(0, -5) : this.herdName()));
}
