import { Component, ViewChild, type ElementRef } from '@angular/core';
import type { Goat } from '../../../../../../shared/services/goat/goat.service';
import { ADGAService } from '../../../services/adga/adga.service';
import { DiffService } from '../../../services/diff/diff.service';
import { GoatService } from '../../../services/goat/goat.service';

@Component({
  selector: 'app-goats',
  templateUrl: './goats.component.html',
  styleUrl: './goats.component.scss'
})
export class GoatsComponent {
  does = this.goatService.does;
  bucks = this.goatService.bucks;
  constructor(private goatService: GoatService, private adgaService: ADGAService, private diffService: DiffService) { }

  get syncing() {
    return this.syncingDoes !== false || this.syncingBucks !== false || this.syncingAll;
  }
  syncingAll = false;
  @ViewChild('dropdown') dropdown!: ElementRef<HTMLUListElement>;
  @ViewChild('dropdownButton') dropdownButton!: ElementRef<HTMLButtonElement>;
  async syncAll() {
    let shown = false;
    if (!this.dropdown.nativeElement.classList.contains('show')) {
      this.dropdownButton.nativeElement.click();
    } else {
      shown = true;
    } this.syncingAll = true;
    try {
      const goats = await this.adgaService.getOwnedGoats();
      await Promise.all([this.syncDoes(goats.filter(goat => goat.sex === 'Female')), this.syncBucks(goats.filter(goat => goat.sex === 'Male'))]);
    } catch (err) {
      await this.adgaService.handleError(err as Error, 'Sync Failed!');
    } finally {
      this.syncingAll = false;
      if (this.dropdown.nativeElement.classList.contains('show')) {
        if (!shown) {
          this.dropdownButton.nativeElement.click();
        } else {
          this.dropdownButton.nativeElement.click();
          this.dropdownButton.nativeElement.click();
        }
      }
    }
  }
  syncingDoes: boolean | number = false;
  async syncDoes(does?: Goat[]) {
    this.syncingDoes = true;
    try {
      does = does ?? (await this.adgaService.getOwnedGoats()).filter(goat => goat.sex === 'Female');
      const oldDoes = await this.goatService.getDoes();
      does = [...structuredClone(oldDoes), ...does.filter(doe => !oldDoes.some(d => d.id === doe.id))];
      for (let i = 0; i < does.length; i++) {
        this.syncingDoes = i;
        const doe = does[i];
        if (doe.id) {
          does[i] = this.diffService.softMerge(doe, await this.adgaService.getGoat(doe.id));
        }
      }
      await this.goatService.setDoes(oldDoes, does);
    } catch (err) {
      await this.adgaService.handleError(err as Error, 'Does Sync Failed!');
    } finally {
      this.syncingDoes = false;
    }
  }
  syncingBucks: boolean | number = false;
  async syncBucks(bucks?: Goat[]) {
    try {
      this.syncingBucks = true;
      bucks = bucks ?? (await this.adgaService.getOwnedGoats()).filter(goat => goat.sex === 'Male');
      const oldBucks = await this.goatService.getBucks();
      bucks = [...structuredClone(oldBucks), ...bucks.filter(buck => !oldBucks.some(b => b.id === buck.id))];
      for (let i = 0; i < bucks.length; i++) {
        this.syncingBucks = i;
        const buck = bucks[i];
        if (buck.id) {
          bucks[i] = this.diffService.softMerge(buck, await this.adgaService.getGoat(buck.id));
        }
      }
      await this.goatService.setBucks(oldBucks, bucks);
    } catch (err) {
      await this.adgaService.handleError(err as Error, 'Bucks Sync Failed!');
    } finally {
      this.syncingBucks = false;
    }
  }
  deleteDoe(index: number) {
    this.goatService.deleteDoe(index);
  }
  deleteBuck(index: number) {
    this.goatService.deleteBuck(index);
  }
}
