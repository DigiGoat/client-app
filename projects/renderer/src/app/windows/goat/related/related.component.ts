import { ChangeDetectionStrategy, Component, inject, signal, type OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GoatService } from '../../../services/goat/goat.service';

@Component({
  selector: 'app-related',
  templateUrl: './related.component.html',
  styleUrl: './related.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class RelatedComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private goatService = inject(GoatService);

  index = signal(-1);
  related = this.goatService.related;
  setter = (index: number, goat: Record<string, unknown>) => this.goatService.updateRelated(index, goat);
  async ngOnInit() {
    this.index.set(Number(this.route.snapshot.params['goat']));
  }
}
