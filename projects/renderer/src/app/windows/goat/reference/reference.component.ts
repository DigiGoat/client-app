import { ChangeDetectionStrategy, Component, inject, signal, type OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GoatService } from '../../../services/goat/goat.service';

@Component({
  selector: 'app-reference',
  templateUrl: './reference.component.html',
  styleUrl: './reference.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class ReferenceComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private goatService = inject(GoatService);

  index = signal(-1);
  references = this.goatService.references;
  setter = (index: number, reference: Record<string, unknown>) => this.goatService.setReference(index, reference);
  async ngOnInit() {
    this.index.set(Number(this.route.snapshot.params['goat']));
  }
}
