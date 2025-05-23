import { Injectable } from '@angular/core';
import type { Goat } from '../../../../../shared/services/goat/goat.service';
import { DialogService } from '../dialog/dialog.service';
import { DiffService } from '../diff/diff.service';
import { GitService } from '../git/git.service';
import { WindowService } from '../window/window.service';

@Injectable({
  providedIn: 'root'
})
export class ADGAService {

  constructor(private dialogService: DialogService, private windowService: WindowService, private diffService: DiffService, private gitService: GitService) { }

  async handleError(err: Error, title: string) {
    if (err.message.includes('No ADGA Account Found!')) {
      const action = await this.dialogService.showMessageBox({ message: title, detail: 'Please login to use this feature', buttons: ['Login', 'Cancel'], type: 'warning' });
      if (action.response === 0) {
        await this.windowService.openLogin();
      }
    } else if (err.message.includes('Invalid Login ID Or Password')) {
      const action = await this.dialogService.showMessageBox({ message: title, detail: 'Invalid Login Credentials. Please Log Back In & Try Again', buttons: ['Login', 'Cancel'], type: 'warning' });
      if (action.response === 0) {
        await this.windowService.openLogin();
      }

    } else if (err.message.includes('git')) {
      await this.gitService.handleError(title, err);
    } else {
      console.error(err);
      await this.dialogService.showMessageBox({ message: title, detail: err.message, type: 'error' });
    }
  }

  getAccount = window.electron.adga.getAccount;
  login = window.electron.adga.login;
  logout = window.electron.adga.logout;
  async getOwnedGoats() {
    const goats = await window.electron.adga.getOwnedGoats();
    return goats.items.map(goat => this.parseGoat(goat)).reverse();
  }
  async getGoat(id: number) {
    return this.parseGoat(await window.electron.adga.getGoat(id));
  }
  async getGoats(ids: number[]) {
    return (await window.electron.adga.getGoats(ids)).items.map(goat => this.parseGoat(goat));
  }
  private parseGoat({ nickname, name, description, dateOfBirth, dateOfDeath, normalizeId, animalTattoo, id, colorAndMarking, sex, damId, sireId, ownerAccount }: Goat): Goat {
    const parsedGoat: Goat = {
      nickname, name: this.diffService.titleCase(name ?? ''), description, dateOfBirth, dateOfDeath, normalizeId, id, sex, damId, sireId, ownerAccount: { displayName: this.diffService.titleCase(ownerAccount?.displayName ?? '') }, colorAndMarking: this.diffService.titleCase(colorAndMarking ?? ''), animalTattoo: animalTattoo?.map(tattoo => ({ tattoo: tattoo.tattoo, tattooLocation: { name: tattoo.tattooLocation?.name } })),
    };
    Object.keys(parsedGoat).forEach(key => {
      if ((parsedGoat[key as keyof Goat]) === undefined) {
        delete parsedGoat[key as keyof Goat];
      }
    });
    return parsedGoat;
  }
  set onchange(callback: () => void) {
    window.electron.adga.onchange(callback);
  }
  async lookupGoatsByName(name: string): Promise<Goat[]> {
    const goats = await window.electron.adga.lookupGoatsByName(name);
    return goats.map(goat => this.parseGoat(goat));
  }
  async lookupGoatsById(normalizeId: string): Promise<Goat[]> {
    const goats = await window.electron.adga.lookupGoatsById(normalizeId);
    return goats.map(goat => this.parseGoat(goat));
  }
  blacklistOwnedGoat = window.electron.adga.blacklistOwnedGoat;
  getBlacklist = window.electron.adga.getBlacklist;
  async getLinearAppraisal(id: number): Promise<Goat['linearAppraisals']> {
    const linearAppraisal = await window.electron.adga.getLinearAppraisal(id);
    /*
    lactationNumber: number;
    lactationStart: '2' | string;
    generalAppearance: LAClassifications;
    dairyStrength: LAClassifications;
    bodyCapacity: LAClassifications;
    mammarySystem: LAClassifications;
    finalScore: number;
    isPermanent: boolean;
    id: number;
    */
    return linearAppraisal.map(({ lactationNumber, appraisalDate, generalAppearance, dairyStrength, bodyCapacity, mammarySystem, finalScore, isPermanent, id }) => ({ lactationNumber, appraisalDate, generalAppearance, dairyStrength, bodyCapacity, mammarySystem, finalScore, isPermanent, id }));
  }
  async getAwards(id: number): Promise<Goat['awards']> {
    const awards = await window.electron.adga.getAwards(id);
    return awards.map(({ awardCode, awardDescription, awardYear, awardCount }) => ({ awardCode, awardDescription: this.diffService.titleCase(awardDescription), awardYear, awardCount }));//.filter(award => !(award.awardCode.includes('CH') || award.awardCode.includes('SG')));
  }
}
