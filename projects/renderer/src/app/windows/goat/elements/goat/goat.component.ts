import { booleanAttribute, ChangeDetectorRef, Component, Input, ViewChild, type ElementRef, type OnInit } from '@angular/core';
import type { Observable } from 'rxjs';
import type { Goat } from '../../../../../../../shared/services/goat/goat.service';
import { ADGAService } from '../../../../services/adga/adga.service';
import { DialogService } from '../../../../services/dialog/dialog.service';
import { DiffService } from '../../../../services/diff/diff.service';
import { WindowService } from '../../../../services/window/window.service';

@Component({
  selector: 'app-goat',
  templateUrl: './goat.component.html',
  styleUrl: './goat.component.scss'
})
export class GoatComponent implements OnInit {
  @Input({ required: true }) getter!: Observable<Goat[]>;
  @Input({ required: true }) index!: number;
  @Input({ required: true }) setter!: (index: number, goat: Goat) => Promise<void>;
  @Input({ transform: booleanAttribute }) related = false;
  constructor(private windowService: WindowService, private dialogService: DialogService, private diffService: DiffService, private adgaService: ADGAService, private cdr: ChangeDetectorRef) { }
  ngOnInit(): void {
    this.windowService.setUnsavedChanges(false);
    let initial = true;
    this.getter.subscribe({
      next: goats => {
        this._oldGoat = goats[this.index] ?? {};
        if (initial) {
          this.goat = goats[this.index] ?? {};
          initial = false;
        }
        this.windowService.setUnsavedChanges(this.unsavedChanges);
        this.cdr.detectChanges();
      }
    });
    this.windowService.onsave = async () => {
      const action = (await this.dialogService.showMessageBox({ message: 'Unsaved Changes!', detail: 'Would you like to continue anyway?', buttons: ['Save Changes', 'Close Without Saving', 'Cancel'], defaultId: 0 })).response;
      switch (action) {
        case 0:
          await this.setter(this.index, this.goat);
          await this.windowService.setUnsavedChanges(false);
          await this.windowService.close();
          break;
        case 1:
          await this.windowService.close(true);
          break;
      }
    };
  }
  /* ------------------------------ Sync Handlers ------------------------------*/
  @ViewChild('dropdown') dropdown!: ElementRef<HTMLUListElement>;
  @ViewChild('dropdownButton') dropdownButton!: ElementRef<HTMLButtonElement>;
  async syncAll() {
    let shown = false;
    if (!this.dropdown.nativeElement.classList.contains('show')) {
      this.dropdownButton.nativeElement.click();
    } else {
      shown = true;
    }
    await Promise.all([this.syncDetails()]);
    if (this.dropdown.nativeElement.classList.contains('show')) {
      if (!shown) {
        this.dropdownButton.nativeElement.click();
      } else {
        this.dropdownButton.nativeElement.click();
        this.dropdownButton.nativeElement.click();
      }
    }
  }
  syncingDetails = false;
  async syncDetails() {
    this.syncingDetails = true;
    try {
      const goat = (this.related ? (await this.adgaService.getGoats([this.goat.id!]))[0] : await this.adgaService.getGoat(this.goat.id!));
      this.goat = this.diffService.softMerge(this.goat, goat);
    } catch (error) {
      await this.adgaService.handleError(error as Error, 'Error Syncing Details!');
    } finally {
      this.syncingDetails = false;
    }
  }
  /* ------------------------------ Object Handlers ------------------------------*/
  _oldGoat: Goat = {};
  _goat: Goat = {};
  get unsavedChangesDiff() {
    return this.diffService.diff(this._oldGoat, this.goat) as Record<string, string>;
  }
  isDirty(parameter: string) {
    return (parameter in this.unsavedChangesDiff);
  }
  get unsavedChanges() {
    return !!Object.keys(this.unsavedChangesDiff).length;
  }
  set goat(goat: Goat) {
    Object.assign(this._goat, goat);
    this.windowService.setTitle(this.goat.nickname || this.goat.name || this.goat.normalizeId || '');
    this.windowService.setUnsavedChanges(this.unsavedChanges);
  }
  get goat() {
    return this._goat;
  }

  /* ------------------------------ Variable Accessors ------------------------------ */
  get nickname() {
    return this.goat.nickname;
  }
  set nickname(nickname) {
    this.goat = { nickname: nickname };
  }
  get name() {
    return this.goat.name;
  }
  set name(name) {
    this.goat = { name: name };
  }
  get dateOfBirth() {
    return this.goat.dateOfBirth;
  }
  set dateOfBirth(dateOfBirth) {
    this.goat = { dateOfBirth: dateOfBirth };
  }
  get id() {
    return this.goat.normalizeId;
  }
  set id(normalizeId) {
    this.goat = { normalizeId: normalizeId };
  }
  get description() {
    return this.goat.description;
  }
  set description(description) {
    this.goat = { description: description };
  }
  get colorAndMarking() {
    return this.goat.colorAndMarking;
  }
  set colorAndMarking(colorAndMarking) {
    this.goat = { colorAndMarking: colorAndMarking };
  }
  get tattoos() {
    return this.goat.animalTattoo;
  }
  set tattoos(animalTattoo) {
    this.goat = { animalTattoo: animalTattoo };
  }
  get damId() {
    return this.goat.damId;
  }
  set damId(damId) {
    this.goat = { damId: damId };
  }
  get sireId() {
    return this.goat.sireId;
  }
  set sireId(sireId) {
    this.goat = { sireId: sireId };
  }
  get owner() {
    return this.goat.ownerAccount?.displayName;
  }
  set owner(owner) {
    this.goat = { ownerAccount: { displayName: owner } };
  }
  setTattooLocation(index: number, location: string) {
    const tattoos = this.goat.animalTattoo ?? [];
    if (tattoos[index].tattooLocation) {
      tattoos[index].tattooLocation!.name = location;
    } else {
      tattoos[index].tattooLocation = { name: location };
    }
    this.tattoos = tattoos;
  }
  setTattooValue(index: number, value: string) {
    const tattoos = this.goat.animalTattoo ?? [];
    tattoos[index].tattoo = value;
    this.tattoos = tattoos;
  }
}
