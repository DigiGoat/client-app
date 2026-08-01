import type { CdkDragDrop } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, inject, ViewChild, type ElementRef } from '@angular/core';
import { startSpan } from '@sentry/electron/renderer';
import { ADGAService } from '../../../services/adga/adga.service';
import { ConfigService } from '../../../services/config/config.service';
import { DiffService } from '../../../services/diff/diff.service';
import { GoatService, type GOAT } from '../../../services/goat/goat.service';
import type { ListLocations } from '../elements/goat-list/goat-list.component';
import { BuckFilter, DoeFilter } from '../elements/goat-lookup/goat-lookup.component';

@Component({
  selector: 'app-goats',
  templateUrl: './goats.component.html',
  styleUrl: './goats.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class GoatsComponent {
  private goatService = inject(GoatService);
  private adgaService = inject(ADGAService);
  private diffService = inject(DiffService);
  private configService = inject(ConfigService);

  does = this.goatService.does;
  bucks = this.goatService.bucks;
  references = this.goatService.references;
  forSale = this.goatService.forSale;
  related = this.goatService.related;
  filters = {
    doe: DoeFilter,
    buck: BuckFilter,
  };

  get syncing() {
    return this.syncingDoes !== false || this.syncingBucks !== false || this.syncingReferences !== false || this.syncingAll || this.syncingRelated !== false || this.syncingForSale !== false;
  }
  syncingAll = false;
  @ViewChild('dropdown') dropdown!: ElementRef<HTMLUListElement>;
  @ViewChild('dropdownButton') dropdownButton!: ElementRef<HTMLButtonElement>;
  async syncAll() {
    await startSpan({ name: 'all', op: 'goats.sync' }, async () => {
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
    });
  }
  syncingDoes: boolean | number = false;
  async syncDoes(does?: Record<string, unknown>[]) {
    await startSpan({ name: 'does', op: 'goats.sync' }, async () => {
      this.syncingDoes = true;
      try {
        does = does ?? (await this.adgaService.getOwnedGoats()).filter(goat => goat.sex === 'Female');
        const oldDoes = await this.goatService.getDoes();
        does = [...structuredClone(oldDoes), ...does.filter(doe => !oldDoes.some(d => doe['id'] && d['id'] === doe['id']))];
        await this.goatService.writeDoes(does);
        try {
          for (let i = 0; i < does.length; i++) {
            this.syncingDoes = i;
            const doe = does[i];
            if (doe['id']) {
              let goat: Record<string, unknown>;
              let linearAppraisals: GOAT['linearAppraisals'] = [];
              let awards: GOAT['awards'] = [];
              let usdaId = doe['usdaId'];
              let usdaKey = doe['usdaKey'];
              let lactationRecords: GOAT['lactationRecords'] = [];
              await Promise.all([
                (async () => goat = await this.adgaService.getGoat(doe['id'] as number))(),
                (async () => linearAppraisals = await this.adgaService.getLinearAppraisal(doe['id'] as number) || [])(),
                (async () => {
                  if ((!usdaId! || !usdaKey!) && doe['normalizeId']) {
                    const cdcbGoat = await this.adgaService.getCDCBGoat(doe['normalizeId'] as string);
                    if (!cdcbGoat) {
                      return;
                    }
                    usdaId = cdcbGoat.animalId;
                    usdaKey = cdcbGoat.animKey;
                  }
                  lactationRecords = await this.adgaService.getLactations(usdaId as string, usdaKey as number);
                })(),
                (async () => awards = await this.adgaService.getAwards(doe['id'] as number) || [])()
              ]);
              does[i] = this.diffService.softMerge(doe, goat!);
              does[i]['linearAppraisals'] = linearAppraisals;
              does[i]['usdaId'] = usdaId;
              does[i]['usdaKey'] = usdaKey;
              does[i]['lactationRecords'] = lactationRecords;
              does[i]['awards'] = awards;
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
    });
  }
  syncingBucks: boolean | number = false;
  async syncBucks(bucks?: Record<string, unknown>[]) {
    await startSpan({ name: 'bucks', op: 'goats.sync' }, async () => {
      try {
        this.syncingBucks = true;
        bucks = bucks ?? (await this.adgaService.getOwnedGoats()).filter(goat => goat.sex === 'Male');
        const oldBucks = await this.goatService.getBucks();
        bucks = [...structuredClone(oldBucks), ...bucks.filter(buck => !oldBucks.some(b => buck['id'] && buck['id'] === b['id']))];
        await this.goatService.writeBucks(bucks);
        try {
          for (let i = 0; i < bucks.length; i++) {
            this.syncingBucks = i;
            const buck = bucks[i];
            if (buck['id']) {
              let goat: Record<string, unknown>;
              let linearAppraisals: GOAT['linearAppraisals'] = [];
              let awards: GOAT['awards'] = [];
              await Promise.all([
                (async () => goat = await this.adgaService.getGoat(buck['id'] as number))(),
                (async () => linearAppraisals = await this.adgaService.getLinearAppraisal(buck['id'] as number) || [])(),
                (async () => awards = await this.adgaService.getAwards(buck['id'] as number) || [])()]);
              bucks[i] = this.diffService.softMerge(buck, goat!);
              bucks[i]['linearAppraisals'] = linearAppraisals;
              bucks[i]['awards'] = awards;
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
    });
  }
  syncingReferences: boolean | number = false;
  async syncReferences() {
    await startSpan({ name: 'references', op: 'goats.sync' }, async () => {
      this.syncingReferences = true;
      try {
        const oldReferences = await this.goatService.getReferences();
        const references = structuredClone(oldReferences);
        try {
          for (let i = 0; i < references.length; i++) {
            this.syncingReferences = i;
            const reference = references[i];
            if (reference['id']) {
              let goat: Record<string, unknown>;
              let linearAppraisals: GOAT['linearAppraisals'] = [];
              let awards: GOAT['awards'] = [];
              await Promise.all([
                (async () => goat = await this.adgaService.getGoat(reference['id'] as number))(),
                (async () => linearAppraisals = await this.adgaService.getLinearAppraisal(reference['id'] as number) || [])(),
                (async () => awards = await this.adgaService.getAwards(reference['id'] as number) || [])()]);
              references[i] = this.diffService.softMerge(reference, goat!);
              references[i]['linearAppraisals'] = linearAppraisals;
              references[i]['awards'] = awards;
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
    });
  }
  syncingForSale: boolean | number = false;
  async syncForSale() {
    await startSpan({ name: 'forSale', op: 'goats.sync' }, async () => {
      try {
        this.syncingForSale = true;
        const oldForSale = await this.goatService.getForSale();
        const forSale = structuredClone(oldForSale);
        try {
          for (let i = 0; i < forSale.length; i++) {
            this.syncingForSale = i;
            const goat = forSale[i];
            if (goat['id']) {
              let _goat: Record<string, unknown>;
              let linearAppraisals: GOAT['linearAppraisals'] = [];
              let awards: GOAT['awards'] = [];
              await Promise.all([
                (async () => _goat = await this.adgaService.getGoat(goat['id'] as number))(),
                (async () => linearAppraisals = await this.adgaService.getLinearAppraisal(goat['id'] as number) || [])(),
                (async () => awards = await this.adgaService.getAwards(goat['id'] as number) || [])()]);
              forSale[i] = this.diffService.softMerge(goat, _goat!);
              forSale[i]['linearAppraisals'] = linearAppraisals;
              forSale[i]['awards'] = awards;
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
    });
  }
  syncingRelated: boolean | number = false;
  async syncRelated() {
    await startSpan({ name: 'related', op: 'goats.sync' }, async () => {
      try {
        this.syncingRelated = true;

        const oldRelated = await this.goatService.getRelated();

        const ids: number[] = [];
        const goats: Record<string, unknown>[] = [];
        const does = await this.goatService.getDoes();
        const bucks = await this.goatService.getBucks();
        (await Promise.all([this.goatService.getDoes(), this.goatService.getBucks(), this.goatService.getReferences(), this.goatService.getForSale()]))
          .forEach(_goats => goats.push(..._goats));
        for (const goat of goats) {
          if (typeof goat['damId'] === 'string') {
            goat['damId'] = does.find(d => d['normalizeId'] && d['normalizeId'] === goat['damId'])?.['id'];
          }
          if (typeof goat['damId'] === 'number' && !ids.includes(goat['damId'])) {
            ids.push(goat['damId']);
          }
          if (typeof goat['sireId'] === 'string') {
            goat['sireId'] = bucks.find(b => b['normalizeId'] === goat['sireId'])?.['id'];
          }
          if (typeof goat['sireId'] === 'number' && !ids.includes(goat['sireId'])) {
            ids.push(goat['sireId']);
          }
        }
        const related = await this.adgaService.getGoats(ids) as Record<string, unknown>[];
        await this.goatService.writeRelated(related.map(goat => this.goatService.parseGoat(goat)));
        try {
          const newIds: number[] = [];
          for (const goat of related) {
            if (typeof goat['damId'] === 'number' && !ids.includes(goat['damId']) && !newIds.includes(goat['damId'])) {
              newIds.push(goat['damId']);
            }
            if (typeof goat['sireId'] === 'number' && !ids.includes(goat['sireId']) && !newIds.includes(goat['sireId'])) {
              newIds.push(goat['sireId']);
            }
          }
          related.push(...(await this.adgaService.getGoats(newIds)));
          for (let i = 0; i < related.length; i++) {
            this.syncingRelated = i;
            related[i] = this.diffService.softMerge(oldRelated[i], related[i]);

            let linearAppraisals: GOAT['linearAppraisals'] = [];
            let awards: GOAT['awards'] = [];
            await Promise.all([
              (async () => linearAppraisals = await this.adgaService.getLinearAppraisal(related![i]['id'] as number) || [])(),
              (async () => awards = await this.adgaService.getAwards(related![i]['id'] as number) || [])()]);
            related[i]['linearAppraisals'] = linearAppraisals;
            related[i]['awards'] = awards;
          }
          if (oldRelated.length || related.length) {
            await this.goatService.setRelated(oldRelated, related as GOAT[]);
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
    });
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
  addDoe(doe: Partial<GOAT>) {
    this.goatService.addDoe(doe);
  }
  addBuck(buck: Partial<GOAT>) {
    this.goatService.addBuck(buck);
  }
  addReference(reference: Partial<GOAT>) {
    this.goatService.addReference(reference);
  }
  addForSale(forSale: Partial<GOAT>) {
    this.goatService.addForSale(forSale);
  }
  rearrangeDoes(event: CdkDragDrop<Record<string, unknown>[]>) {
    this.goatService.rearrangeDoes(event);
  }
  rearrangeBucks(event: CdkDragDrop<Record<string, unknown>[]>) {
    this.goatService.rearrangeBucks(event);
  }
  rearrangeReferences(event: CdkDragDrop<Record<string, unknown>[]>) {
    this.goatService.rearrangeReferences(event);
  }
  rearrangeForSale(event: CdkDragDrop<Record<string, unknown>[]>) {
    this.goatService.rearrangeForSale(event);
  }

  get referencesEnabled() {
    return true;//this.configService.references;
  }
  set referencesEnabled(enabled: boolean) {
    this.configService.getConfig().then(oldConfig => {
      this.configService.saveConfig(oldConfig, { ...oldConfig, references: enabled });
    });
  }
  get forSaleEnabled() {
    return true;//this.configService.forSale;
  }
  set forSaleEnabled(enabled: boolean) {
    this.configService.getConfig().then(oldConfig => {
      this.configService.saveConfig(oldConfig, { ...oldConfig, forSale: enabled });
    });
  }
  moveGoat(event: { goat: Partial<GOAT>; location: ListLocations; keepCopy: boolean; index: number; }, from: 'Does' | 'Bucks' | 'References' | 'For Sale') {
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
