import { moveItemInArray, type CdkDragDrop } from '@angular/cdk/drag-drop';
import { booleanAttribute, Component, EventEmitter, Input, Output, type OnInit } from '@angular/core';
import type { Observable } from 'rxjs';
import type { Goat, GoatType } from '../../../../../../../shared/services/goat/goat.service';
import { DialogService } from '../../../../services/dialog/dialog.service';
import { WindowService } from '../../../../services/window/window.service';


@Component({
  selector: 'app-goat-list',
  templateUrl: './goat-list.component.html',
  styleUrl: './goat-list.component.scss',
  standalone: false
})
export class GoatListComponent implements OnInit {
  @Input({ required: true, alias: 'goats' }) _goats!: Observable<Goat[]>;
  @Input({ required: true }) type!: GoatType;
  @Input() syncing?: boolean | number = false;
  @Input({ transform: booleanAttribute }) enabled?: boolean;
  @Output() enabledChange = new EventEmitter<boolean>();
  @Output() deleteIndex = new EventEmitter<number>;
  @Output() addGoat = new EventEmitter<Goat>();
  @Output() rearranged = new EventEmitter<CdkDragDrop<Goat[]>>();
  @Input() filter?: (goat: Goat) => boolean;
  @Input() listName?: ListLocations;
  @Output() moveGoat = new EventEmitter<{ goat: Goat, location: ListLocations, keepCopy: boolean, index: number; }>();
  goats: Goat[] = [];

  constructor(private windowService: WindowService, private dialogService: DialogService) { }

  ngOnInit() {
    this._goats.subscribe({
      next: goats => {
        this.goats = goats;
        //! WARNING: THIS WILL CAUSE THE APP TO CRASH! - this.cdr.detectChanges(); // Notify Angular that the component's data has changed
      }
    });
  }

  async openGoat(index: number) {
    this.windowService.openGoat(this.type, index);
  }

  async deleteGoat(event: MouseEvent, index: number) {
    event.stopPropagation();
    const action = await this.dialogService.showMessageBox({ message: `Are you sure you want to delete ${this.goats[index].nickname || this.goats[index].name || 'this goat'}?`, buttons: ['Yes', 'No'], type: 'warning' });
    if (action.response === 0) {
      this.deleteIndex.emit(index);
    }
  }
  newGoat(goat: Goat) {
    //this.windowService.openGoat(this.type, this.goats.length);
    this.addGoat.emit(goat);
  }
  openImages(event: MouseEvent, index: number) {
    event.stopPropagation();
    const { normalizeId, name, nickname } = this.goats[index];
    this.windowService.openImages([normalizeId, name, nickname].filter(param => param !== undefined) as string[]);
  }
  lookupFilter = (goat: Goat) => {
    if (this.goats.find(_goat => _goat.id === goat.id)) {
      return false;
    } else if (this.filter) {
      return this.filter(goat);
    } else {
      return true;
    }
  };
  rearrange(event: CdkDragDrop<Goat[]>) {
    moveItemInArray(this.goats, event.previousIndex, event.currentIndex);
    this.rearranged.emit(event);
  }

  async _moveGoat(event: MouseEvent, index: number) {
    event.stopPropagation();
    const goat = this.goats[index];
    const options = ['References', 'For Sale', 'Cancel'].filter(option => option != this.listName);
    if (goat.sex === 'Female' && this.listName !== 'Does') {
      options.unshift('Does');
    }
    if (goat.sex === 'Male' && this.listName !== 'Bucks') {
      options.unshift('Bucks');
    }
    const action = await this.dialogService.showMessageBox({ type: 'question', message: `Move ${goat.nickname || goat.name || goat.normalizeId}?`, detail: `Where would you like to move ${goat.nickname || goat.name || goat.normalizeId} to?`, buttons: options, cancelId: options.indexOf('Cancel'), checkboxLabel: `Keep a copy of ${goat.nickname || goat.name || goat.normalizeId} in the current list`, defaultId: 0 });
    if (action.response !== options.indexOf('Cancel')) {
      this.moveGoat.emit({ goat, location: options[action.response] as ListLocations, keepCopy: action.checkboxChecked, index });
    }
  }
}
export type ListLocations = 'Does' | 'Bucks' | 'References' | 'For Sale' | 'Cancel';
