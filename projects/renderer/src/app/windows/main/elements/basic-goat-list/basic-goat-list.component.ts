import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import type { Goat } from '../../../../../../../shared/services/goat/goat.service';
import type { Observable } from 'rxjs';

@Component({
  selector: 'app-basic-goat-list',
  templateUrl: './basic-goat-list.component.html',
  styleUrl: './basic-goat-list.component.scss'
})
export class BasicGoatListComponent implements OnInit {
  @Input({ required: true, alias: 'goats' }) _goats!: Observable<Goat[]>;
  @Input() syncing?: boolean | number = false;

  goats: Goat[] = [];

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this._goats.subscribe({
      next: goats => {
        this.goats = goats;
        this.cdr.detectChanges(); // Notify Angular that the component's data has changed
      }
    });
  }
}
