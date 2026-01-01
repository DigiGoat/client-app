import type { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, ViewChild, type ElementRef } from '@angular/core';
import type { Goat } from '../../../../../../shared/services/goat/goat.service';
import { ADGAService } from '../../../services/adga/adga.service';
import { ConfigService } from '../../../services/config/config.service';
import { DiffService } from '../../../services/diff/diff.service';
import { GoatService } from '../../../services/goat/goat.service';
import type { ListLocations } from '../elements/goat-list/goat-list.component';
import { BuckFilter, DoeFilter } from '../elements/goat-lookup/goat-lookup.component';

@Component({
  selector: 'app-goats',
  templateUrl: './goats.component.html',
  styleUrl: './goats.component.scss',
  standalone: false
})
export class GoatsComponent {
  does = this.goatService.does;
  bucks = this.goatService.bucks;
  references = this.goatService.references;
  forSale = this.goatService.forSale;
  related = this.goatService.related;
  filters = {
    doe: DoeFilter,
    buck: BuckFilter,
  };
  constructor(private goatService: GoatService, private adgaService: ADGAService, private diffService: DiffService, private configService: ConfigService) { }

  get syncing() {
    return this.syncingDoes !== false || this.syncingBucks !== false || this.syncingReferences !== false || this.syncingAll || this.syncingRelated !== false || this.syncingForSale !== false;
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
      await Promise.all([(async () => {
        this.syncingDoes = true;
        this.syncingBucks = true;
        const goats = await this.adgaService.getOwnedGoats();
        await Promise.all([this.syncDoes(goats.filter(goat => goat.sex === 'Female')), this.syncBucks(goats.filter(goat => goat.sex === 'Male'))]);
      })(), this.syncReferences(), this.syncForSale()]);
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
            let goat: Goat;
            let linearAppraisals: Goat['linearAppraisals'];
            let awards: Goat['awards'];
            let usdaId = doe.usdaId;
            let usdaKey = doe.usdaKey;
            let lactationRecords: Goat['lactationRecords'];
            await Promise.all([(async () => goat = await this.adgaService.getGoat(doe.id!))(), (async () => linearAppraisals = await this.adgaService.getLinearAppraisal(doe.id!))(), (async () => {
              if (!usdaId! || !usdaKey!) {
                const cdcbGoat = await this.adgaService.getCDCBGoat(doe.normalizeId!);
                if (!cdcbGoat) {
                  return;
                }
                usdaId = cdcbGoat.animalId;
                usdaKey = cdcbGoat.animKey;
              }
              lactationRecords = await this.adgaService.getLactations(usdaId, usdaKey);
            })(), (async () => awards = await this.adgaService.getAwards(doe.id!))()]);
            does![i] = this.diffService.softMerge(doe, goat!);
            does![i].linearAppraisals = linearAppraisals;
            does![i].usdaId = usdaId;
            does![i].usdaKey = usdaKey;
            does![i].lactationRecords = lactationRecords;
            does![i].awards = awards;
          }
        }
        if (oldDoes.length || does.length) {
          await this.goatService.setDoes(oldDoes, does);
        }
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
            let goat: Goat;
            let linearAppraisals: Goat['linearAppraisals'];
            let awards: Goat['awards'];
            await Promise.all([(async () => goat = await this.adgaService.getGoat(buck.id!))(), (async () => linearAppraisals = await this.adgaService.getLinearAppraisal(buck.id!))(), (async () => awards = await this.adgaService.getAwards(buck.id!))()]);
            bucks[i] = this.diffService.softMerge(buck, goat!);
            bucks[i].linearAppraisals = linearAppraisals;
            bucks[i].awards = awards;
          }
        }
        if (oldBucks.length || bucks.length) {
          await this.goatService.setBucks(oldBucks, bucks);
        }
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
  syncingReferences: boolean | number = false;
  async syncReferences() {
    this.syncingReferences = true;
    try {
      const oldReferences = await this.goatService.getReferences();
      const references = structuredClone(oldReferences);
      try {
        for (let i = 0; i < references.length; i++) {
          this.syncingReferences = i;
          const reference = references[i];
          if (reference.id) {
            let goat: Goat;
            let linearAppraisals: Goat['linearAppraisals'];
            let awards: Goat['awards'];
            await Promise.all([(async () => goat = await this.adgaService.getGoat(reference.id!))(), (async () => linearAppraisals = await this.adgaService.getLinearAppraisal(reference.id!))(), (async () => awards = await this.adgaService.getAwards(reference.id!))()]);
            references[i] = this.diffService.softMerge(reference, goat!);
            references[i].linearAppraisals = linearAppraisals;
            references[i].awards = awards;
          }
        }
        if (oldReferences.length || references.length) {
          await this.goatService.setReferences(oldReferences, references);
        }
      } catch (err) {
        await this.goatService.writeReferences(oldReferences);
        await this.adgaService.handleError(err as Error, 'References Sync Failed!');
      }
    } catch (err) {
      await this.adgaService.handleError(err as Error, 'References Sync Failed!');
    } finally {
      this.syncingReferences = false;
    }
  }
  syncingForSale: boolean | number = false;
  async syncForSale() {
    try {
      this.syncingForSale = true;
      const oldForSale = await this.goatService.getForSale();
      const forSale = structuredClone(oldForSale);
      try {
        for (let i = 0; i < forSale.length; i++) {
          this.syncingForSale = i;
          const goat = forSale[i];
          if (goat.id) {
            let _goat: Goat;
            let linearAppraisals: Goat['linearAppraisals'];
            let awards: Goat['awards'];
            await Promise.all([(async () => _goat = await this.adgaService.getGoat(goat.id!))(), (async () => linearAppraisals = await this.adgaService.getLinearAppraisal(goat.id!))(), (async () => awards = await this.adgaService.getAwards(goat.id!))()]);
            forSale[i] = this.diffService.softMerge(goat, _goat!);
            forSale[i].linearAppraisals = linearAppraisals;
            forSale[i].awards = awards;
          }
        }
        if (oldForSale.length || forSale.length) {
          await this.goatService.setForSale(oldForSale, forSale);
        }
      } catch (err) {
        await this.goatService.writeForSale(oldForSale);
        await this.adgaService.handleError(err as Error, 'For Sale Sync Failed!');
      }
    } catch (err) {
      await this.adgaService.handleError(err as Error, 'For Sale Sync Failed!');
    } finally {
      this.syncingForSale = false;
    }
  }
  syncingRelated: boolean | number = false;
  async syncRelated() {
    try {
      this.syncingRelated = true;

      const oldRelated = await this.goatService.getRelated();

      const ids: number[] = [];
      const goats: Goat[] = [];
      const does = await this.goatService.getDoes();
      const bucks = await this.goatService.getBucks();
      (await Promise.all([this.goatService.getDoes(), this.goatService.getBucks(), this.goatService.getReferences(), this.goatService.getForSale()])).forEach(_goats => goats.push(..._goats));
      for (const goat of goats) {
        if (typeof goat.damId === 'string') {
          goat.damId = does.find(d => d.normalizeId === goat.damId)?.id;
        }
        if (goat.damId && !ids.includes(goat.damId)) {
          ids.push(goat.damId);
        }
        if (typeof goat.sireId === 'string') {
          goat.sireId = bucks.find(b => b.normalizeId === goat.sireId)?.id;
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
          const goat = related[i];
          if (goat.damId && !ids.includes(goat.damId) && !newIds.includes(goat.damId)) {
            newIds.push(goat.damId);
          }
          if (goat.sireId && !ids.includes(goat.sireId) && !newIds.includes(goat.sireId)) {
            newIds.push(goat.sireId);
          }
        }
        related.push(...(await this.adgaService.getGoats(newIds)));
        for (let i = 0; i < related.length; i++) {
          this.syncingRelated = i;
          related[i] = this.diffService.softMerge(oldRelated[i], related[i]);

          let linearAppraisals: Goat['linearAppraisals'];
          let awards: Goat['awards'];
          await Promise.all([(async () => linearAppraisals = await this.adgaService.getLinearAppraisal(related[i].id!))(), (async () => awards = await this.adgaService.getAwards(related[i].id!))()]);
          related[i].linearAppraisals = linearAppraisals;
          related[i].awards = awards;
        }
        if (oldRelated.length || related.length) {
          await this.goatService.setRelated(oldRelated, related);
        }
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
  deleteReference(index: number) {
    this.goatService.deleteReference(index);
  }
  deleteForSale(index: number) {
    this.goatService.deleteForSale(index);
  }
  addDoe(doe: Goat) {
    this.goatService.addDoe(doe);
  }
  addBuck(buck: Goat) {
    this.goatService.addBuck(buck);
  }
  addReference(reference: Goat) {
    this.goatService.addReference(reference);
  }
  addForSale(forSale: Goat) {
    this.goatService.addForSale(forSale);
  }
  rearrangeDoes(event: CdkDragDrop<Goat[]>) {
    this.goatService.rearrangeDoes(event);
  }
  rearrangeBucks(event: CdkDragDrop<Goat[]>) {
    this.goatService.rearrangeBucks(event);
  }
  rearrangeReferences(event: CdkDragDrop<Goat[]>) {
    this.goatService.rearrangeReferences(event);
  }
  rearrangeForSale(event: CdkDragDrop<Goat[]>) {
    this.goatService.rearrangeForSale(event);
  }

  get referencesEnabled() {
    return this.configService.references;
  }
  set referencesEnabled(enabled: boolean) {
    this.configService.references = enabled;
    this.configService.saveChanges();
  }
  get forSaleEnabled() {
    return this.configService.forSale;
  }
  set forSaleEnabled(enabled: boolean) {
    this.configService.forSale = enabled;
    this.configService.saveChanges();
  }
  moveGoat(event: { goat: Goat; location: ListLocations; keepCopy: boolean, index: number; }, from: 'Does' | 'Bucks' | 'References' | 'For Sale') {
    if (!event.goat.sex) {
      if (from === 'Does' || event.location === 'Does') {
        event.goat.sex = 'Female';
      } else if (from === 'Bucks' || event.location === 'Bucks') {
        event.goat.sex = 'Male';
      }
    }
    switch (event.location) {
      case 'Does':
        this.goatService.addDoe(event.goat);
        break;
      case 'Bucks':
        this.goatService.addBuck(event.goat);
        break;
      case 'References':
        this.goatService.addReference(event.goat);
        break;
      case 'For Sale':
        this.goatService.addForSale(event.goat);
        break;
    }
    if (!event.keepCopy) {
      switch (from) {
        case 'Does':
          this.goatService.deleteDoe(event.index);
          break;
        case 'Bucks':
          this.goatService.deleteBuck(event.index);
          break;
        case 'References':
          this.goatService.deleteReference(event.index);
          break;
        case 'For Sale':
          this.goatService.deleteForSale(event.index);
          break;
      }
    }
  }
}
