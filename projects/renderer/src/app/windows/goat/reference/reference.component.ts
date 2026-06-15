import { Component, type OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import type { Goat } from '../../../../../../shared/services/goat/goat.service';
import { GoatService } from '../../../services/goat/goat.service';

@Component({
  selector: 'app-reference',
  templateUrl: './reference.component.html',
  styleUrl: './reference.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class ReferenceComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private goatService = inject(GoatService);

  index = -1;
  references = this.goatService.references;
  setter = (index: number, reference: Goat) => this.goatService.setReference(index, reference);
  async ngOnInit() {
    this.index = Number(this.route.snapshot.params['goat']);
  }
}
