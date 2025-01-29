import { Component, Input, OnInit } from '@angular/core';
import type { Observable } from 'rxjs';
import type { Goat } from '../../../../../../../shared/services/goat/goat.service';
import { WindowService } from '../../../../services/window/window.service';

@Component({
  selector: 'app-basic-goat-list',
  templateUrl: './basic-goat-list.component.html',
  styleUrl: './basic-goat-list.component.scss',
  standalone: false
})
export class BasicGoatListComponent implements OnInit {
  @Input({ required: true, alias: 'goats' }) _goats!: Observable<Goat[]>;
  @Input() syncing?: boolean | number = false;

  goats: Goat[] = [];

  constructor(private windowService: WindowService) { }

  ngOnInit() {
    this._goats.subscribe({
      next: goats => {
        this.goats = goats;
      }
    });
  }
  async openGoat(index: number) {
    this.windowService.openGoat('related', index);
  }
}
