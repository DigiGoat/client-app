import { Component, type OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GoatService } from '../../../services/goat/goat.service';
import type { Goat } from '../../../../../../shared/services/goat/goat.service';

@Component({
  selector: 'app-related',
  templateUrl: './related.component.html',
  styleUrl: './related.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class RelatedComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private goatService = inject(GoatService);

  index = -1;
  related = this.goatService.related;
  setter = (index: number, goat: Goat) => this.goatService.updateRelated(index, goat);
  async ngOnInit() {
    this.index = Number(this.route.snapshot.params['goat']);
  }
}
