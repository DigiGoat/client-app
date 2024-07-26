import { Injectable } from '@angular/core';
import type { Goat } from '../../../../../shared/services/goat/goat.service';
import { DialogService } from '../dialog/dialog.service';
import { DiffService } from '../diff/diff.service';
import { WindowService } from '../window/window.service';

@Injectable({
  providedIn: 'root'
})
export class ADGAService {

  constructor(private dialogService: DialogService, private windowService: WindowService, private diffService: DiffService) { }

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

    } else {
      await this.dialogService.showMessageBox({ message: title, detail: err.message, type: 'error' });
    }
  }

  getAccount = window.electron.adga.getAccount;
  login = window.electron.adga.login;
  logout = window.electron.adga.logout;
  async getOwnedGoats() {
    const goats = await window.electron.adga.getOwnedGoats();
    return goats.items.map(goat => this.parseGoat(goat));
  }
  async getGoat(id: number) {
    return this.parseGoat(await window.electron.adga.getGoat(id));
  }
  private parseGoat({ nickname, name, description, dateOfBirth, normalizeId, animalTattoo, id, colorAndMarking, sex }: Goat): Goat {
    const parsedGoat = {
      nickname, name: this.diffService.titleCase(name ?? ''), description, dateOfBirth, normalizeId, id, sex, colorAndMarking: this.diffService.titleCase(colorAndMarking ?? ''), animalTattoo: animalTattoo?.map(tattoo => ({ tattoo: tattoo.tattoo, tattooLocation: { name: tattoo.tattooLocation?.name } })),
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
}
