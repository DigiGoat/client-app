import { Component, EventEmitter, Input, Output, type OnInit } from '@angular/core';
import type { Observable } from 'rxjs';
import type { Goat, GoatType } from '../../../../../../../shared/services/goat/goat.service';
import { GoatService } from '../../../../services/goat/goat.service';
import { WindowService } from '../../../../services/window/window.service';


@Component({
  selector: 'app-goat-list',
  templateUrl: './goat-list.component.html',
  styleUrl: './goat-list.component.scss'
})
export class GoatListComponent implements OnInit {
  @Input({ required: true, alias: 'goats' }) _goats!: Observable<Goat[]>;
  @Input({ required: true }) type!: GoatType;
  @Input() syncing?: boolean | number = false;
  @Output() deleteIndex = new EventEmitter<number>;
  @Output() addGoat = new EventEmitter<Goat>();
  @Input() filter?: (goat: Goat) => boolean;
  goats: Goat[] = [];

  constructor(private windowService: WindowService, private goatService: GoatService) { }

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

  deleteGoat(event: MouseEvent, index: number) {
    event.stopPropagation();
    this.deleteIndex.emit(index);
  }
  newGoat(goat: Goat) {
    //this.windowService.openGoat(this.type, this.goats.length);
    this.addGoat.emit(goat);
  }
  openImages(event: MouseEvent, index: number) {
    event.stopPropagation();
    const { normalizeId, name, nickname } = this.goats[index];
    this.windowService.openImages([nickname, name, normalizeId].filter(param => param !== undefined) as string[]);
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
}
