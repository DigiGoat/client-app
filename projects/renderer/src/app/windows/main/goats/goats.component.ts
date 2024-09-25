import type { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, ViewChild, type ElementRef } from '@angular/core';
import type { Goat } from '../../../../../../shared/services/goat/goat.service';
import { ADGAService } from '../../../services/adga/adga.service';
import { DiffService } from '../../../services/diff/diff.service';
import { GoatService } from '../../../services/goat/goat.service';
import { BuckFilter, DoeFilter } from '../elements/goat-lookup/goat-lookup.component';

@Component({
  selector: 'app-goats',
  templateUrl: './goats.component.html',
  styleUrl: './goats.component.scss',
})
export class GoatsComponent {
  does = this.goatService.does;
  bucks = this.goatService.bucks;
  related = this.goatService.related;
  filters = {
    doe: DoeFilter,
    buck: BuckFilter,
  };
  constructor(private goatService: GoatService, private adgaService: ADGAService, private diffService: DiffService) { }

  get syncing() {
    return this.syncingDoes !== false || this.syncingBucks !== false || this.syncingAll || this.syncingRelated !== false;
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
      await this.syncRelated();
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
      await this.goatService.writeDoes(does);
      try {
        for (let i = 0; i < does.length; i++) {
          this.syncingDoes = i;
          const doe = does[i];
          if (doe.id) {
            does[i] = this.diffService.softMerge(doe, await this.adgaService.getGoat(doe.id));
          }
        }
        await this.goatService.setDoes(oldDoes, does);
      } catch (err) {
        await this.goatService.writeDoes(oldDoes);
        await this.adgaService.handleError(err as Error, 'Does Sync Failed!');
      }
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
      await this.goatService.writeBucks(bucks);
      try {
        for (let i = 0; i < bucks.length; i++) {
          this.syncingBucks = i;
          const buck = bucks[i];
          if (buck.id) {
            bucks[i] = this.diffService.softMerge(buck, await this.adgaService.getGoat(buck.id));
          }
        }
        await this.goatService.setBucks(oldBucks, bucks);
      } catch (err) {
        await this.goatService.writeBucks(oldBucks);
        await this.adgaService.handleError(err as Error, 'Bucks Sync Failed!');
      }
    } catch (err) {
      await this.adgaService.handleError(err as Error, 'Bucks Sync Failed!');
    } finally {
      this.syncingBucks = false;
    }
  }
  syncingRelated: boolean | number = false;
  async syncRelated() {
    try {
      this.syncingRelated = true;

      const oldRelated = await this.goatService.getRelated();

      const ids: number[] = [];
      const goats: Goat[] = [];
      (await Promise.all([this.goatService.getDoes(), this.goatService.getBucks()])).forEach(_goats => goats.push(..._goats));
      for (const goat of goats) {
        if (goat.damId && !ids.includes(goat.damId)) {
          ids.push(goat.damId);
        }
        if (goat.sireId && !ids.includes(goat.sireId)) {
          ids.push(goat.sireId);
        }
      }
      const related = await this.adgaService.getGoats(ids);
      await this.goatService.writeRelated(related);
      try {
        const newIds: number[] = [];
        for (let i = 0; i < related.length; i++) {
          this.syncingRelated = i;
          const goat = related[i];
          if (goat.damId && !ids.includes(goat.damId) && !newIds.includes(goat.damId)) {
            newIds.push(goat.damId);
          }
          if (goat.sireId && !ids.includes(goat.sireId) && !newIds.includes(goat.sireId)) {
            newIds.push(goat.sireId);
          }
        }
        related.push(...(await this.adgaService.getGoats(newIds)));
        await this.goatService.setRelated(oldRelated, related);
      } catch (err) {
        await this.goatService.writeRelated(oldRelated);
        await this.adgaService.handleError(err as Error, 'Related Goats Sync Failed!');
      }
    } catch (err) {
      console.warn('Related Goats Sync Failed:', err);
      await this.adgaService.handleError(err as Error, 'Related Goats Sync Failed!');
    } finally {
      this.syncingRelated = false;
    }
  }
  deleteDoe(index: number) {
    this.goatService.deleteDoe(index);
  }
  deleteBuck(index: number) {
    this.goatService.deleteBuck(index);
  }
  rearrangeDoes(event: CdkDragDrop<Goat[]>) {
    this.goatService.rearrangeDoes(event);
  }

  addDoe(doe: Goat) {
    this.goatService.addDoe(doe);
  }
  addBuck(buck: Goat) {
    this.goatService.addBuck(buck);
  }
  rearrangeBucks(event: CdkDragDrop<Goat[]>) {
    this.goatService.rearrangeBucks(event);
  }
}
