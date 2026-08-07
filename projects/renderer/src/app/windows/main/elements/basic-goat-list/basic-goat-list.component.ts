import { ChangeDetectionStrategy, Component, inject, Input, OnInit, signal } from '@angular/core';
import type { Observable } from 'rxjs';
import type { GOAT } from '../../../../services/goat/goat.service';
import { WindowService } from '../../../../services/window/window.service';

type Goat = Partial<Pick<GOAT, 'name' | 'normalizeId' | 'nickname'>>;
@Component({
  selector: 'app-basic-goat-list',
  templateUrl: './basic-goat-list.component.html',
  styleUrl: './basic-goat-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class BasicGoatListComponent implements OnInit {
  private windowService = inject(WindowService);

  @Input({ required: true, alias: 'goats' }) _goats!: Observable<Goat[]>;
  @Input() syncing?: boolean | number = false;

  goats = signal<Goat[]>([]);
  loading = signal(true);

  ngOnInit() {
    this._goats.subscribe({
      next: goats => {
        this.loading.set(true);
        this.goats.set(goats);
        this.loading.set(false);
      }
    });
  }
  async openGoat(index: number) {
    this.windowService.openGoat('related', index);
  }
}
