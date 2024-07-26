import { Component, EventEmitter, Output } from '@angular/core';
import type { Goat } from '../../../../../../../shared/services/goat/goat.service';
import { ADGAService } from '../../../../services/adga/adga.service';
import { DiffService } from '../../../../services/diff/diff.service';
import { GoatService } from '../../../../services/goat/goat.service';

@Component({
  selector: 'app-goat-lookup',
  templateUrl: './goat-lookup.component.html',
  styleUrl: './goat-lookup.component.scss'
})
export class GoatLookupComponent {
  nameGoats?: Goat[] = [];
  idGoats?: Goat[] = [];
  @Output() goatSelected = new EventEmitter<Goat>();

  constructor(private adgaService: ADGAService, private diffService: DiffService, private goatService: GoatService) { }
  async lookupGoats(search: string) {
    await Promise.all([(async () => {
      this.idGoats = undefined;
      this.idGoats = await this.adgaService.lookupGoatsById(search);
    })(), (async () => {
      this.nameGoats = undefined;
      this.nameGoats = await this.adgaService.lookupGoatsByName(search);
    })()]);
  }
  formatGoat(goat: Goat, search: string) {
    goat = structuredClone(goat);
    goat.normalizeId = goat.normalizeId?.replace(new RegExp(`(${search})`, 'ig'), '<span class="text-info">$1</span>');
    goat.name = goat.name?.replace(new RegExp(`(${search})`, 'ig'), '<span class="text-info">$1</span>');
    return goat;
  }
}
