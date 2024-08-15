import { Component, EventEmitter, Input, Output } from '@angular/core';
import type { Goat } from '../../../../../../../shared/services/goat/goat.service';
import { ADGAService } from '../../../../services/adga/adga.service';

@Component({
  selector: 'app-goat-lookup',
  templateUrl: './goat-lookup.component.html',
  styleUrl: './goat-lookup.component.scss'
})
export class GoatLookupComponent {
  nameGoats?: Goat[] = [];
  idGoats?: Goat[] = [];
  @Output() goatSelected = new EventEmitter<Goat>();
  @Input() filter?: (goat: Goat) => boolean;

  constructor(private adgaService: ADGAService) { }
  async lookupGoats(search: string) {
    await Promise.all([(async () => {
      this.idGoats = undefined;
      this.idGoats = await this.adgaService.lookupGoatsById(search);
      if (this.filter) this.idGoats = this.idGoats.filter(this.filter);
    })(), (async () => {
      this.nameGoats = undefined;
      this.nameGoats = await this.adgaService.lookupGoatsByName(search);
      if (this.filter) this.nameGoats = this.nameGoats.filter(this.filter);
    })()]);
  }
  formatGoat(goat: Goat, search: string) {
    goat = structuredClone(goat);
    goat.normalizeId = goat.normalizeId?.replace(new RegExp(`(${search})`, 'ig'), '<span class="text-info">$1</span>');
    goat.name = goat.name?.replace(new RegExp(`(${search})`, 'ig'), '<span class="text-info">$1</span>');
    return goat;
  }
}
export const BuckFilter = (goat: Goat) => goat.sex === 'Male';
export const DoeFilter = (goat: Goat) => goat.sex === 'Female';
