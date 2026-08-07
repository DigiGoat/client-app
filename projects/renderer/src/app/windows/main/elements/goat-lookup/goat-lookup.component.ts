import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { ADGAService } from '../../../../services/adga/adga.service';
import type { GOAT } from '../../../../services/goat/goat.service';

type Goat = Partial<Pick<GOAT, 'name' | 'normalizeId'>>;
@Component({
  selector: 'app-goat-lookup',
  templateUrl: './goat-lookup.component.html',
  styleUrl: './goat-lookup.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class GoatLookupComponent {
  private adgaService = inject(ADGAService);

  nameGoats = signal<Goat[] | undefined>([]);
  idGoats = signal<Goat[] | undefined>([]);
  @Output() goatSelected = new EventEmitter<Goat>();
  @Input() filter?: (goat: Goat) => boolean;
  async lookupGoats(search: string) {
    await Promise.all([(async () => {
      this.idGoats.set(undefined);
      this.idGoats.set(await this.adgaService.lookupGoatsById(search));
      if (this.filter) this.idGoats.update(goats => goats?.filter(this.filter!) ?? []);
    })(), (async () => {
      this.nameGoats.set(undefined);
      this.nameGoats.set((await this.adgaService.lookupGoatsByName(search)));
      if (this.filter) this.nameGoats.update(goats => goats?.filter(this.filter!) ?? []);
    })()]);
  }
  formatGoat(goat: Goat, search: string) {
    const newGoat = structuredClone(goat);
    if (typeof goat['normalizeId'] === 'string') {
      newGoat['normalizeId'] = goat['normalizeId'].replace(new RegExp(`(${search})`, 'ig'), '<span class="text-info">$1</span>');
    }
    if (typeof goat['name'] === 'string') {
      newGoat['name'] = goat['name'].replace(new RegExp(`(${search})`, 'ig'), '<span class="text-info">$1</span>');
    }
    return newGoat as Goat;
  }
}
export const BuckFilter = (goat: Record<string, unknown>) => goat['sex'] === 'Male';
export const DoeFilter = (goat: Record<string, unknown>) => goat['sex'] === 'Female';
