import { ChangeDetectorRef, Component, Input, type OnInit } from '@angular/core';
import type { Observable } from 'rxjs';
import type { Goat, GoatType } from '../../../../../../../shared/services/goat/goat.service';
import { WindowService } from '../../../../services/window/window.service';


@Component({
  selector: 'app-goat-list',
  templateUrl: './goat-list.component.html',
  styleUrl: './goat-list.component.scss'
})
export class GoatListComponent implements OnInit {
  @Input({ required: true, alias: 'goats' }) _goats!: Observable<Goat[]>;
  @Input({ required: true }) type!: GoatType;
  goats: Goat[] = [];

  constructor(private windowService: WindowService, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this._goats.subscribe({
      next: goats => {
        this.goats = goats;
        this.cdr.detectChanges(); // Notify Angular that the component's data has changed
      }
    });
  }

  async openGoat(index: number) {
    this.windowService.openGoat(this.type, index);
  }
}