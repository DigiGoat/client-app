import { moveItemInArray, type CdkDragDrop } from '@angular/cdk/drag-drop';
import { Injectable, inject } from '@angular/core';
import type { LAClassifications } from 'adga';
import { Observable } from 'rxjs';
import type { LactationRecord } from '../../../../../shared/services/goat/goat.service';
import { ADGAService } from '../adga/adga.service';
import { DiffService } from '../diff/diff.service';
import { GitService } from '../git/git.service';

@Injectable({
  providedIn: 'root'
})
export class GoatService {
  private gitService = inject(GitService);
  private diffService = inject(DiffService);
  private adgaService = inject(ADGAService);

  does = new Observable<GOAT[]>(observer => {
    this.getDoes().then(does =>
      observer.next(does)
    );
    window.electron.goat.onDoesChange(does =>
      observer.next(does.map(doe => this.parseGoat(doe)))
    );
  });
  getDoes = async () => (await window.electron.goat.getDoes()).map(goat => this.parseGoat(goat));
  async setDoe(index: number, doe: Partial<GOAT>) {
    const does = await window.electron.goat.getDoes();
    const diffMessage = this.diffService.commitMsg(does[index], doe);
    does[index] = doe;
    await window.electron.goat.setDoes(does);
    await this.gitService.commitDoes([`Updated ${doe.nickname || doe.name || doe.normalizeId}`, ...diffMessage]);
  }
  async setDoes(oldDoes: Partial<GOAT>[], newDoes: Partial<GOAT>[]) {
    const diffMessage = ['Synced Does'];
    for (let i = 0; i < oldDoes.length; i++) {
      const diff = this.diffService.commitMsg(oldDoes[i], newDoes[i]).map(msg => `${this.diffService.spaces}${msg}`);
      if (diff.length) {
        diffMessage.push(`Updated ${newDoes[i].nickname || newDoes[i].name || newDoes[i].normalizeId || oldDoes[i].nickname || oldDoes[i].name || oldDoes[i].normalizeId || 'Unknown'}`, ...diff);
      }
    }
    for (let i = oldDoes.length; i < newDoes.length; i++) {
      diffMessage.push(`Added ${newDoes[i].nickname || newDoes[i].name || newDoes[i].normalizeId}`, ...this.diffService.commitMsg({}, newDoes[i]).map(msg => `${this.diffService.spaces}${msg}`));
    }
    await window.electron.goat.setDoes(newDoes);
    await this.gitService.commitDoes(diffMessage);
  }
  async writeDoes(does: Record<string, unknown>[]) {
    await window.electron.goat.setDoes(does);
  }
  async deleteDoe(index: number) {
    const does = await this.getDoes();
    const doe = does.splice(index, 1)[0];
    await window.electron.goat.setDoes(does);
    await this.gitService.commitDoes([`Deleted ${doe['nickname'] || doe['name'] || doe['normalizeId']}`]);
    if (typeof doe['id'] === 'number') {
      await this.adgaService.blacklistOwnedGoat(doe['id']);
    }
  }
  async addDoe(doe: Partial<GOAT>) {
    const does = await this.getDoes();
    does.push(this.parseGoat(doe));
    await window.electron.goat.setDoes(does);
    await this.gitService.commitDoes([`Added ${doe['nickname'] || doe['name'] || doe['normalizeId']}`, ...this.diffService.commitMsg({}, doe).map(msg => `${this.diffService.spaces}${msg}`)]);
  }
  async rearrangeDoes(event: CdkDragDrop<Record<string, unknown>[]>) {
    const does = await this.getDoes();
    moveItemInArray(does, event.previousIndex, event.currentIndex);
    const doe = does[event.currentIndex];
    await window.electron.goat.setDoes(does);
    await this.gitService.commitDoes(['Rearranged Does', `Moved ${doe['nickname'] || doe['name'] || doe['normalizeId']} ${event.previousIndex > event.currentIndex ? 'Up' : 'Down'} ${Math.abs(event.previousIndex - event.currentIndex)} Position${Math.abs(event.previousIndex - event.currentIndex) === 1 ? '' : 's'}`]);
  }
  bucks = new Observable<(GOAT)[]>(observer => {
    window.electron.goat.getBucks().then(bucks =>
      observer.next(bucks.map(buck => this.parseGoat(buck))));
    window.electron.goat.onBucksChange(bucks =>
      observer.next(bucks.map(buck => this.parseGoat(buck))));
  });

  getBucks = window.electron.goat.getBucks;
  async setBuck(index: number, buck: Partial<GOAT>) {
    const bucks = await window.electron.goat.getBucks();
    const diffMessage = this.diffService.commitMsg(bucks[index], buck);
    bucks[index] = buck;
    await window.electron.goat.setBucks(bucks);
    await this.gitService.commitBucks([`Updated ${buck['nickname'] || buck['name'] || buck['normalizeId']}`, ...diffMessage]);
  }
  async setBucks(oldBucks: Partial<GOAT>[], newBucks: Partial<GOAT>[]) {
    const diffMessage = ['Synced Bucks'];
    for (let i = 0; i < oldBucks.length; i++) {
      const diff = this.diffService.commitMsg(oldBucks[i], newBucks[i]).map(msg => `${this.diffService.spaces}${msg}`);
      if (diff.length) {
        diffMessage.push(`Updated ${newBucks[i]['nickname'] || newBucks[i]['name'] || newBucks[i]['normalizeId'] || oldBucks[i]['nickname'] || oldBucks[i]['name'] || oldBucks[i]['normalizeId'] || 'Unknown'}`, ...diff);
      }
    }
    for (let i = oldBucks.length; i < newBucks.length; i++) {
      diffMessage.push(`Added ${newBucks[i]['nickname'] || newBucks[i]['name'] || newBucks[i]['normalizeId']}`, ...this.diffService.commitMsg({}, newBucks[i]).map(msg => `${this.diffService.spaces}${msg}`));
    }
    await window.electron.goat.setBucks(newBucks);
    await this.gitService.commitBucks(diffMessage);
  }
  async writeBucks(bucks: Partial<GOAT>[]) {
    await window.electron.goat.setBucks(bucks);
  }
  async deleteBuck(index: number) {
    const bucks = await this.getBucks();
    const buck = bucks.splice(index, 1)[0];
    await window.electron.goat.setBucks(bucks);
    await this.gitService.commitBucks([`Deleted ${buck['nickname'] || buck['name'] || buck['normalizeId']}`]);
    if (typeof buck['id'] === 'number') {
      await this.adgaService.blacklistOwnedGoat(buck['id']);
    }
  }
  async addBuck(buck: Partial<GOAT>) {
    const bucks = await this.getBucks();
    bucks.push(buck);
    await window.electron.goat.setBucks(bucks);
    await this.gitService.commitBucks([`Added ${buck['nickname'] || buck['name'] || buck['normalizeId']}`, ...this.diffService.commitMsg({}, buck).map(msg => `${this.diffService.spaces}${msg}`)]);
  }
  async rearrangeBucks(event: CdkDragDrop<Record<string, unknown>[]>) {
    const bucks = await this.getBucks();
    moveItemInArray(bucks, event.previousIndex, event.currentIndex);
    const buck = bucks[event.currentIndex];
    await window.electron.goat.setBucks(bucks);
    await this.gitService.commitBucks(['Rearranged Bucks', `Moved ${buck['nickname'] || buck['name'] || buck['normalizeId']} ${event.previousIndex > event.currentIndex ? 'Up' : 'Down'} ${Math.abs(event.previousIndex - event.currentIndex)} Position${Math.abs(event.previousIndex - event.currentIndex) === 1 ? '' : 's'}`]);
  }
  references = new Observable<(GOAT)[]>(observer => {
    window.electron.goat.getReferences().then(references =>
      observer.next(references.map(reference => this.parseGoat(reference))));
    window.electron.goat.onReferencesChange(references =>
      observer.next(references.map(reference => this.parseGoat(reference))));
  });
  getReferences = window.electron.goat.getReferences;
  async setReference(index: number, reference: Partial<GOAT>) {
    const references = await window.electron.goat.getReferences();
    const diffMessage = this.diffService.commitMsg(references[index], reference);
    references[index] = reference;
    await window.electron.goat.setReferences(references);
    await this.gitService.commitReferences([`Updated ${reference.nickname || reference.name || reference.normalizeId}`, ...diffMessage]);
  }
  async setReferences(oldReferences: Partial<GOAT>[], newReferences: Partial<GOAT>[]) {
    const diffMessage = ['Synced References'];
    for (let i = 0; i < oldReferences.length; i++) {
      const diff = this.diffService.commitMsg(oldReferences[i], newReferences[i]).map(msg => `${this.diffService.spaces}${msg}`);
      if (diff.length) {
        diffMessage.push(`Updated ${newReferences[i].nickname || newReferences[i].name || newReferences[i].normalizeId || oldReferences[i].nickname || oldReferences[i].name || oldReferences[i].normalizeId || 'Unknown'}`, ...diff);
      }
    }
    for (let i = oldReferences.length; i < newReferences.length; i++) {
      diffMessage.push(`Added ${newReferences[i].nickname || newReferences[i].name || newReferences[i].normalizeId}`, ...this.diffService.commitMsg({}, newReferences[i]).map(msg => `${this.diffService.spaces}${msg}`));
    }
    await window.electron.goat.setReferences(newReferences);
    await this.gitService.commitReferences(diffMessage);
  }
  async writeReferences(references: Partial<GOAT>[]) {
    await window.electron.goat.setReferences(references);
  }
  async deleteReference(index: number) {
    const references = await this.getReferences();
    const reference = references.splice(index, 1)[0];
    await window.electron.goat.setReferences(references);
    await this.gitService.commitReferences([`Deleted ${reference['nickname'] || reference['name'] || reference['normalizeId']}`]);
    if (typeof reference['id'] === 'number') {
      await this.adgaService.blacklistOwnedGoat(reference['id']);
    }
  }
  async addReference(reference: Partial<GOAT>) {
    const references = await this.getReferences();
    references.push(reference);
    await window.electron.goat.setReferences(references);
    await this.gitService.commitReferences([`Added ${reference['nickname'] || reference['name'] || reference['normalizeId']}`, ...this.diffService.commitMsg({}, reference).map(msg => `${this.diffService.spaces}${msg}`)]);
  }
  async rearrangeReferences(event: CdkDragDrop<Record<string, unknown>[]>) {
    const references = await this.getReferences();
    moveItemInArray(references, event.previousIndex, event.currentIndex);
    const reference = references[event.currentIndex];
    await window.electron.goat.setReferences(references);
    await this.gitService.commitReferences(['Rearranged References', `Moved ${reference['nickname'] || reference['name'] || reference['normalizeId']} ${event.previousIndex > event.currentIndex ? 'Up' : 'Down'} ${Math.abs(event.previousIndex - event.currentIndex)} Position${Math.abs(event.previousIndex - event.currentIndex) === 1 ? '' : 's'}`]);
  }
  forSale = new Observable<(GOAT)[]>(observer => {
    window.electron.goat.getForSale().then(forSale =>
      observer.next(forSale.map(forSaleGoat => this.parseGoat(forSaleGoat))));
    window.electron.goat.onForSaleChange(forSale =>
      observer.next(forSale.map(forSaleGoat => this.parseGoat(forSaleGoat))));
  });
  getForSale = window.electron.goat.getForSale;
  async setForSale(oldForSale: Partial<GOAT>[], newForSale: Partial<GOAT>[]) {
    const diffMessage = ['Synced Goats For Sale'];
    for (let i = 0; i < oldForSale.length; i++) {
      const diff = this.diffService.commitMsg(oldForSale[i], newForSale[i]).map(msg => `${this.diffService.spaces}${msg}`);
      if (diff.length) {
        diffMessage.push(`Updated ${newForSale[i].nickname || newForSale[i].name || newForSale[i].normalizeId || oldForSale[i].nickname || oldForSale[i].name || oldForSale[i].normalizeId || 'Unknown'}`, ...diff);
      }
    }
    for (let i = oldForSale.length; i < newForSale.length; i++) {
      diffMessage.push(`Added ${newForSale[i].nickname || newForSale[i].name || newForSale[i].normalizeId}`, ...this.diffService.commitMsg({}, newForSale[i]).map(msg => `${this.diffService.spaces}${msg}`));
    }
    await window.electron.goat.setForSale(newForSale);
    await this.gitService.commitForSale(diffMessage);
  }
  async writeForSale(forSale: Partial<GOAT>[]) {
    await window.electron.goat.setForSale(forSale);
  }
  async updateForSale(index: number, goat: Partial<GOAT>) {
    const forSale = await window.electron.goat.getForSale();
    const diffMessage = this.diffService.commitMsg(forSale[index], goat);
    forSale[index] = goat;
    await window.electron.goat.setForSale(forSale);
    await this.gitService.commitForSale([`Updated ${goat.nickname || goat.name || goat.normalizeId}`, ...diffMessage]);
  }
  async deleteForSale(index: number) {
    const forSale = await this.getForSale();
    const goat = forSale.splice(index, 1)[0];
    await window.electron.goat.setForSale(forSale);
    await this.gitService.commitForSale([`Deleted ${goat['nickname'] || goat['name'] || goat['normalizeId']}`]);
  }
  async addForSale(goat: Partial<GOAT>) {
    const forSale = await this.getForSale();
    forSale.push(goat);
    await window.electron.goat.setForSale(forSale);
    await this.gitService.commitForSale([`Added ${goat['nickname'] || goat['name'] || goat['normalizeId']}`, ...this.diffService.commitMsg({}, goat).map(msg => `${this.diffService.spaces}${msg}`)]);
  }
  async rearrangeForSale(event: CdkDragDrop<Record<string, unknown>[]>) {
    const forSale = await this.getForSale();
    moveItemInArray(forSale, event.previousIndex, event.currentIndex);
    const goat = forSale[event.currentIndex];
    await window.electron.goat.setForSale(forSale);
    await this.gitService.commitForSale(['Rearranged For Sale', `Moved ${goat['nickname'] || goat['name'] || goat['normalizeId']} ${event.previousIndex > event.currentIndex ? 'Up' : 'Down'} ${Math.abs(event.previousIndex - event.currentIndex)} Position${Math.abs(event.previousIndex - event.currentIndex) === 1 ? '' : 's'}`]);
  }
  related = new Observable<(GOAT)[]>(observer => {
    window.electron.goat.getRelated().then(related =>
      observer.next(related.map(related => this.parseGoat(related))));
    window.electron.goat.onRelatedChange(related =>
      observer.next(related.map(related => this.parseGoat(related))));
  });
  getRelated = window.electron.goat.getRelated;
  async setRelated(oldRelated: Partial<GOAT>[], newRelated: Partial<GOAT>[]) {
    const diffMessage = ['Synced Related Goats'];
    for (let i = 0; i < oldRelated.length; i++) {
      const diff = this.diffService.commitMsg(oldRelated[i], newRelated[i]).map(msg => `${this.diffService.spaces}${msg}`);
      if (diff.length) {
        diffMessage.push(`Updated ${newRelated[i].nickname || newRelated[i].name || newRelated[i].normalizeId || oldRelated[i].nickname || oldRelated[i].name || oldRelated[i].normalizeId || 'Unknown'}`, ...diff);
      }
    }
    for (let i = oldRelated.length; i < newRelated.length; i++) {
      diffMessage.push(`Added ${newRelated[i].nickname || newRelated[i].name || newRelated[i].normalizeId}`, ...this.diffService.commitMsg({}, newRelated[i]).map(msg => `${this.diffService.spaces}${msg}`));
    }
    await window.electron.goat.setRelated(newRelated);
    await this.gitService.commitRelated(diffMessage);
  }
  async writeRelated(related: Partial<GOAT>[]) {
    await window.electron.goat.setRelated(related);
  }
  async updateRelated(index: number, goat: Partial<GOAT>) {
    const related = await window.electron.goat.getRelated();
    const diffMessage = this.diffService.commitMsg(related[index], goat);
    related[index] = goat;
    await window.electron.goat.setRelated(related);
    await this.gitService.commitRelated([`Updated ${goat.nickname || goat.name || goat.normalizeId}`, ...diffMessage]);
  }
  async getKiddingSchedule() {
    return (await window.electron.goat.getKiddingSchedule()).map(kidding => this.parseKidding(kidding));
  }
  setKiddingSchedule = window.electron.goat.setKiddingSchedule;
  set onKiddingScheduleChange(callback: (kiddingSchedule: Partial<GOAT>[]) => void) {
    window.electron.goat.onKiddingScheduleChange(callback);
  }
  kiddingSchedule = new Observable<KIDDING[]>(observer => {
    this.getKiddingSchedule().then(kiddingSchedule => observer.next(kiddingSchedule));
    window.electron.goat.onKiddingScheduleChange(kiddingSchedule => observer.next(kiddingSchedule.map(kidding => this.parseKidding(kidding))));
  });
  rearrangeKiddingSchedule = async (event: CdkDragDrop<KIDDING[]>) => {
    const kiddingSchedule = await this.getKiddingSchedule();
    moveItemInArray(kiddingSchedule, event.previousIndex, event.currentIndex);
    await window.electron.goat.setKiddingSchedule(kiddingSchedule);
    const kidding = kiddingSchedule[event.currentIndex];
    await this.gitService.commitKiddingSchedule(['Rearranged Kidding Schedule', `Moved ${kidding.dam || '(Unknown)'} x ${kidding.sire || '(Unknown)'} ${event.previousIndex > event.currentIndex ? 'Up' : 'Down'} ${Math.abs(event.previousIndex - event.currentIndex)} Position${Math.abs(event.previousIndex - event.currentIndex) === 1 ? '' : 's'}`]);
  };
  addKidding = async (kidding: Partial<KIDDING>) => {
    const kiddingSchedule = await this.getKiddingSchedule();
    kiddingSchedule.push(this.parseKidding(kidding));
    await window.electron.goat.setKiddingSchedule(kiddingSchedule);
    await this.gitService.commitKiddingSchedule([`Added ${kidding.dam || '(Unknown)'} x ${kidding.sire || '(Unknown)'}`, ...this.diffService.commitMsg({}, kidding).map(msg => `${this.diffService.spaces}${msg}`)]);
  };
  deleteKidding = async (index: number) => {
    const kiddingSchedule = await this.getKiddingSchedule();
    const kidding = kiddingSchedule.splice(index, 1)[0];
    await window.electron.goat.setKiddingSchedule(kiddingSchedule);
    await this.gitService.commitKiddingSchedule([`Deleted ${kidding.dam || '(Unknown)'} x ${kidding.sire || '(Unknown)'}`]);
  };
  updateKidding = async (index: number, kidding: Partial<KIDDING>) => {
    const kiddingSchedule = await this.getKiddingSchedule();
    const diffMessage = this.diffService.commitMsg(kiddingSchedule[index], kidding);
    kiddingSchedule[index] = this.parseKidding(kidding);
    await window.electron.goat.setKiddingSchedule(kiddingSchedule);
    await this.gitService.commitKiddingSchedule([`Updated ${kidding.dam || '(Unknown)'} x ${kidding.sire || '(Unknown)'}`, ...diffMessage]);
  };

  parseKidding(kidding: Record<string, unknown>) {
    return {
      ...KIDDING,
      ...kidding
    } as KIDDING;
  }
  parseGoat(goat: Record<string, unknown>): GOAT {
    const animalTattoos = normalizeAnimalTattoos((goat as { animalTattoo?: unknown; }).animalTattoo);

    return {
      ...GOAT,
      /* Migrations */
      owner: (goat as { ownerAccount?: { displayName?: string; } | null; }).ownerAccount?.displayName || '',
      tattoos: animalTattoos.map(tattoo => ({ location: tattoo.tattoo || '', description: tattoo.tattooLocation?.name || '' })),
      /* --------- */
      ...goat
    } as GOAT;
  }
}
interface AnimalTattoo {
  tattoo?: string;
  tattooLocation?: {
    name?: string;
  };
}

function normalizeAnimalTattoos(animalTattoo: unknown): AnimalTattoo[] {
  if (!animalTattoo) {
    return [];
  }

  if (Array.isArray(animalTattoo)) {
    return animalTattoo as AnimalTattoo[];
  }

  if (typeof animalTattoo === 'object') {
    return Object.values(animalTattoo as Record<string, AnimalTattoo>);
  }

  return [];
}

export type GOAT = typeof GOAT;
export const GOAT = {
  nickname: '',
  name: '',
  description: '',
  normalizeId: '',
  dateOfBirth: '',
  dateOfDeath: '',
  colorAndMarking: '',
  id: +'',
  sex: '' as 'Female' | 'Male',
  damId: +'' as number | string,
  sireId: +'' as number | string,
  owner: '',
  linearAppraisals: [] as Partial<{
    lactationNumber: number;
    appraisalDate: string;
    generalAppearance: LAClassifications;
    dairyStrength: LAClassifications;
    bodyCapacity: LAClassifications;
    mammarySystem: LAClassifications;
    finalScore: number;
    isPermanent: boolean;
    id: number;
  }>[],

  pet: false,
  price: '',
  awards: [] as Partial<{ awardCode: string; awardDescription: string; awardYear: number; awardCount: number; }>[],
  usdaId: '',
  usdaKey: +'',
  lactationRecords: [] as LactationRecord[],
  tattoos: [] as { location: string, description: string; }[],
};

export const KIDDING = {
  dam: '',
  sire: '',
  exposed: '',
  due: '',
  kidded: '',
  description: '',

};
export type KIDDING = typeof KIDDING;