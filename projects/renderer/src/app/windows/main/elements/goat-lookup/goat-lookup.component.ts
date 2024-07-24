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
  goats?: Goat[] = [];
  @Output() goatSelected = new EventEmitter<Goat>();

  constructor(private adgaService: ADGAService, private diffService: DiffService, private goatService: GoatService) { }
  async lookupGoats(id: string) {
    this.goats = undefined;
    this.goats = await this.adgaService.lookupGoats([Number(id)]);
  }
}
