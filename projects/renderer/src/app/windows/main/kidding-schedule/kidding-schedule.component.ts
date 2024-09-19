import { moveItemInArray, type CdkDragDrop } from '@angular/cdk/drag-drop';
import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, type OnInit } from '@angular/core';
import type { Goat, Kidding } from '../../../../../../shared/services/goat/goat.service';
import { ConfigService } from '../../../services/config/config.service';
import { DialogService } from '../../../services/dialog/dialog.service';
import { DiffService } from '../../../services/diff/diff.service';
import { GitService } from '../../../services/git/git.service';
import { GoatService } from '../../../services/goat/goat.service';
import { WindowService } from '../../../services/window/window.service';

@Component({
  selector: 'app-kidding-schedule',
  templateUrl: './kidding-schedule.component.html',
  styleUrl: './kidding-schedule.component.scss'
})
export class KiddingScheduleComponent implements OnInit {
  private oldBreedings: Kidding[] = [];
  public breedings: Kidding[] = [];
  public does?: Goat[];
  public bucks?: Goat[];
  constructor(private configService: ConfigService, private diffService: DiffService, private goatService: GoatService, private cdr: ChangeDetectorRef, private gitService: GitService, private windowService: WindowService, private dialogService: DialogService) { }
  get enabled() {
    return this.configService.kiddingSchedule;
  }
  set enabled(enabled: boolean) {
    this.configService.kiddingSchedule = enabled;
    this.configService.saveChanges();
  }
  async ngOnInit() {
    this.breedings = await this.goatService.getKiddingSchedule();
    this.goatService.kiddingSchedule.subscribe({
      next: breedings => {
        this.oldBreedings = breedings;
        this.cdr.detectChanges();
      }
    });
    this.windowService.onsave = async () => {
      const action = (await this.dialogService.showMessageBox({ message: 'Unsaved Changes!', detail: 'Would you like to continue anyway?', buttons: ['Save Changes', 'Close Without Saving', 'Cancel'], defaultId: 0 })).response;
      switch (action) {
        case 0:
          await this.saveChanges();
          await this.windowService.close(true);
          break;
        case 1:
          await this.windowService.close(true);
          break;
      }
    };
    this.goatService.getDoes().then(does => this.does = does);
    this.goatService.getBucks().then(bucks => this.bucks = bucks);
  }
  rearrange(event: CdkDragDrop<Kidding[]>) {
    moveItemInArray(this.breedings, event.previousIndex, event.currentIndex);
  }

  calculateDueDate(date?: string, dam?: string, invert?: boolean) {
    if (!date) {
      return;
    }
    let days = 150;
    if (dam && dam.startsWith('PD')) {
      //Nigerian Dwarf - 145 day gestation
      days = 145;
    }
    if (invert) {
      days = -days;
    }
    const oldDate = new Date(date);
    const newDate = new Date(oldDate.getTime() + days * 24 * 60 * 60 * 1000);
    return newDate.toString();
  }
  getDiff(index: number, param: keyof Kidding) {
    if (this.oldBreedings[index] === undefined) return true;
    return param in this.diffService.diff(this.oldBreedings[index], this.breedings[index]);
  }
  getChanges() {
    const changes = JSON.stringify(this.oldBreedings) !== JSON.stringify(this.breedings);
    this.windowService.setUnsavedChanges(changes);
    return changes;
  }
  async saveChanges() {
    const diffMessage = ['Updated Kidding Schedule'];
    const breedingLength = this.breedings.length;
    const oldBreedingLength = this.oldBreedings.length;
    for (let i = 0; i < breedingLength; i++) {
      if (i >= oldBreedingLength) {
        diffMessage.push(`Added Breeding ${i}`, ...this.diffService.commitMsg({}, this.breedings[i]).map(d => `      ${d}`));
      } else {
        const diff = this.diffService.commitMsg(this.oldBreedings[i], this.breedings[i]);
        if (diff.length) {
          diffMessage.push(`Updated Breeding ${i}`, ...diff.map(d => `      ${d}`));
        }
      }
    }
    for (let i = breedingLength; i < oldBreedingLength; i++) {
      if (i >= breedingLength) {
        diffMessage.push(`Removed Breeding ${i}`);
      } else {
        const diff = this.diffService.commitMsg(this.oldBreedings[i], this.breedings[i]);
        if (diff.length) {
          diffMessage.push(`Updated Breeding ${i}`, ...diff.map(d => `      ${d}`));
        }
      }
    }
    await this.goatService.setKiddingSchedule(this.breedings);
    await this.gitService.commitKiddingSchedule(diffMessage);
  }
  formatGoat(id: string, goats?: Goat[], bredDate?: string, dueDate?: string) {
    const goat = goats?.find(goat => goat.normalizeId === id);
    if (goat) {
      const datePipe = new DatePipe('en-US');
      let html = '<div class="card color-scheme-quaternary"><div class="card-body">';
      if (goat.name) {
        html += `<h5 class="card-title">${goat.name}</h5>`;
      }
      if (goat.dateOfBirth) {
        html += `<h6 class="card-subtitle mb-2 text-body-secondary">Born: ${datePipe.transform(goat.dateOfBirth, 'longDate')}</h6>`;
        if (bredDate && Date.parse(bredDate)) {
          const years = Math.floor((new Date(bredDate).getTime() - new Date(goat.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365));
          const months = Math.floor((new Date(bredDate).getTime() - new Date(goat.dateOfBirth).getTime() - (years * 1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
          html += `<p class="card-text text-body-secondary">Age When Bred: ${years} year${years !== 1 ? 's' : ''} and ${months} month${months !== 1 ? 's' : ''}</p>`;
        }
        if (dueDate && Date.parse(dueDate)) {
          const years = Math.floor((new Date(dueDate).getTime() - new Date(goat.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365));
          const months = Math.floor((new Date(dueDate).getTime() - new Date(goat.dateOfBirth).getTime() - (years * 1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
          html += `<p class="card-text text-body-secondary">Age When Due: ${years} year${years !== 1 ? 's' : ''} and ${months} month${months !== 1 ? 's' : ''}</p>`;
        }
      }
      html += '</div></div>';
      return html;
    }
    return '';
  }
}
