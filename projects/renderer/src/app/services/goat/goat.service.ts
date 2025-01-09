import { moveItemInArray, type CdkDragDrop } from '@angular/cdk/drag-drop';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import type { Goat, Kidding } from '../../../../../shared/services/goat/goat.service';
import { ADGAService } from '../adga/adga.service';
import { DiffService } from '../diff/diff.service';
import { GitService } from '../git/git.service';

@Injectable({
  providedIn: 'root'
})
export class GoatService {

  constructor(private gitService: GitService, private diffService: DiffService, private adgaService: ADGAService) { }
  does = new Observable<Goat[]>(observer => {
    window.electron.goat.getDoes().then(does => observer.next(does));
    window.electron.goat.onDoesChange(does => observer.next(does));
  });
  getDoes = window.electron.goat.getDoes;
  async setDoe(index: number, doe: Goat) {
    const does = await window.electron.goat.getDoes();
    const diffMessage = this.diffService.commitMsg(does[index], doe);
    does[index] = doe;
    await window.electron.goat.setDoes(does);
    await this.gitService.commitDoes([`Updated ${doe.nickname || doe.name || doe.normalizeId}`, ...diffMessage]);
  }
  async setDoes(oldDoes: Goat[], newDoes: Goat[]) {
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
  async writeDoes(does: Goat[]) {
    await window.electron.goat.setDoes(does);
  }
  async deleteDoe(index: number) {
    const does = await this.getDoes();
    const doe = does.splice(index, 1)[0];
    await window.electron.goat.setDoes(does);
    await this.gitService.commitDoes([`Deleted ${doe.nickname || doe.name || doe.normalizeId}`]);
    if (doe.id) {
      await this.adgaService.blacklistOwnedGoat(doe.id);
    }
  }
  async addDoe(doe: Goat) {
    const does = await this.getDoes();
    does.push(doe);
    await window.electron.goat.setDoes(does);
    await this.gitService.commitDoes([`Added ${doe.nickname || doe.name || doe.normalizeId}`, ...this.diffService.commitMsg({}, doe).map(msg => `${this.diffService.spaces}${msg}`)]);
  }
  async rearrangeDoes(event: CdkDragDrop<Goat[]>) {
    const does = await this.getDoes();
    moveItemInArray(does, event.previousIndex, event.currentIndex);
    const doe = does[event.currentIndex];
    await window.electron.goat.setDoes(does);
    await this.gitService.commitDoes([`Moved ${doe.nickname || doe.name || doe.normalizeId} ${event.previousIndex > event.currentIndex ? 'Up' : 'Down'} ${Math.abs(event.previousIndex - event.currentIndex)} Position${Math.abs(event.previousIndex - event.currentIndex) === 1 ? '' : 's'}`]);
  }
  bucks = new Observable<Goat[]>(observer => {
    window.electron.goat.getBucks().then(bucks => observer.next(bucks));
    window.electron.goat.onBucksChange(bucks => observer.next(bucks));
  });

  getBucks = window.electron.goat.getBucks;
  async setBuck(index: number, buck: Goat) {
    const bucks = await window.electron.goat.getBucks();
    const diffMessage = this.diffService.commitMsg(bucks[index], buck);
    bucks[index] = buck;
    await window.electron.goat.setBucks(bucks);
    await this.gitService.commitBucks([`Updated ${buck.nickname || buck.name || buck.normalizeId}`, ...diffMessage]);
  }
  async setBucks(oldBucks: Goat[], newBucks: Goat[]) {
    const diffMessage = ['Synced Bucks'];
    for (let i = 0; i < oldBucks.length; i++) {
      const diff = this.diffService.commitMsg(oldBucks[i], newBucks[i]).map(msg => `${this.diffService.spaces}${msg}`);
      if (diff.length) {
        diffMessage.push(`Updated ${newBucks[i].nickname || newBucks[i].name || newBucks[i].normalizeId || oldBucks[i].nickname || oldBucks[i].name || oldBucks[i].normalizeId || 'Unknown'}`, ...diff);
      }
    }
    for (let i = oldBucks.length; i < newBucks.length; i++) {
      diffMessage.push(`Added ${newBucks[i].nickname || newBucks[i].name || newBucks[i].normalizeId}`, ...this.diffService.commitMsg({}, newBucks[i]).map(msg => `${this.diffService.spaces}${msg}`));
    }
    await window.electron.goat.setBucks(newBucks);
    await this.gitService.commitBucks(diffMessage);
  }
  async writeBucks(bucks: Goat[]) {
    await window.electron.goat.setBucks(bucks);
  }
  async deleteBuck(index: number) {
    const bucks = await this.getBucks();
    const buck = bucks.splice(index, 1)[0];
    await window.electron.goat.setBucks(bucks);
    await this.gitService.commitBucks([`Deleted ${buck.nickname || buck.name || buck.normalizeId}`]);
    if (buck.id) {
      await this.adgaService.blacklistOwnedGoat(buck.id);
    }
  }
  async addBuck(buck: Goat) {
    const bucks = await this.getBucks();
    bucks.push(buck);
    await window.electron.goat.setBucks(bucks);
    await this.gitService.commitBucks([`Added ${buck.nickname || buck.name || buck.normalizeId}`, ...this.diffService.commitMsg({}, buck).map(msg => `${this.diffService.spaces}${msg}`)]);
  }
  async rearrangeBucks(event: CdkDragDrop<Goat[]>) {
    const bucks = await this.getBucks();
    moveItemInArray(bucks, event.previousIndex, event.currentIndex);
    const buck = bucks[event.currentIndex];
    await window.electron.goat.setBucks(bucks);
    await this.gitService.commitBucks([`Moved ${buck.nickname || buck.name || buck.normalizeId} ${event.previousIndex > event.currentIndex ? 'Up' : 'Down'} ${Math.abs(event.previousIndex - event.currentIndex)} Position${Math.abs(event.previousIndex - event.currentIndex) === 1 ? '' : 's'}`]);
  }
  references = new Observable<Goat[]>(observer => {
    window.electron.goat.getReferences().then(references => observer.next(references));
    window.electron.goat.onReferencesChange(references => observer.next(references));
  });
  getReferences = window.electron.goat.getReferences;
  async setReference(index: number, reference: Goat) {
    const references = await window.electron.goat.getReferences();
    const diffMessage = this.diffService.commitMsg(references[index], reference);
    references[index] = reference;
    await window.electron.goat.setReferences(references);
    await this.gitService.commitReferences([`Updated ${reference.nickname || reference.name || reference.normalizeId}`, ...diffMessage]);
  }
  async setReferences(oldReferences: Goat[], newReferences: Goat[]) {
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
  async writeReferences(references: Goat[]) {
    await window.electron.goat.setReferences(references);
  }
  async deleteReference(index: number) {
    const references = await this.getReferences();
    const reference = references.splice(index, 1)[0];
    await window.electron.goat.setReferences(references);
    await this.gitService.commitReferences([`Deleted ${reference.nickname || reference.name || reference.normalizeId}`]);
    if (reference.id) {
      await this.adgaService.blacklistOwnedGoat(reference.id);
    }
  }
  async addReference(reference: Goat) {
    const references = await this.getReferences();
    references.push(reference);
    await window.electron.goat.setReferences(references);
    await this.gitService.commitReferences([`Added ${reference.nickname || reference.name || reference.normalizeId}`, ...this.diffService.commitMsg({}, reference).map(msg => `${this.diffService.spaces}${msg}`)]);
  }
  async rearrangeReferences(event: CdkDragDrop<Goat[]>) {
    const references = await this.getReferences();
    moveItemInArray(references, event.previousIndex, event.currentIndex);
    const reference = references[event.currentIndex];
    await window.electron.goat.setReferences(references);
    await this.gitService.commitReferences([`Moved ${reference.nickname || reference.name || reference.normalizeId} ${event.previousIndex > event.currentIndex ? 'Up' : 'Down'} ${Math.abs(event.previousIndex - event.currentIndex)} Position${Math.abs(event.previousIndex - event.currentIndex) === 1 ? '' : 's'}`]);
  }
  related = new Observable<Goat[]>(observer => {
    window.electron.goat.getRelated().then(related => observer.next(related));
    window.electron.goat.onRelatedChange(related => observer.next(related));
  });
  getRelated = window.electron.goat.getRelated;
  async setRelated(oldRelated: Goat[], newRelated: Goat[]) {
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
  async writeRelated(related: Goat[]) {
    await window.electron.goat.setRelated(related);
  }
  async updateRelated(index: number, goat: Goat) {
    const related = await window.electron.goat.getRelated();
    const diffMessage = this.diffService.commitMsg(related[index], goat);
    related[index] = goat;
    await window.electron.goat.setRelated(related);
    await this.gitService.commitRelated([`Updated ${goat.nickname || goat.name || goat.normalizeId}`, ...diffMessage]);
  }
  getKiddingSchedule = window.electron.goat.getKiddingSchedule;
  setKiddingSchedule = window.electron.goat.setKiddingSchedule;
  set onKiddingScheduleChange(callback: (kiddingSchedule: Goat[]) => void) {
    window.electron.goat.onKiddingScheduleChange(callback);
  }
  kiddingSchedule = new Observable<Kidding[]>(observer => {
    window.electron.goat.getKiddingSchedule().then(kiddingSchedule => observer.next(kiddingSchedule));
    window.electron.goat.onKiddingScheduleChange(kiddingSchedule => observer.next(kiddingSchedule));
  });
}
