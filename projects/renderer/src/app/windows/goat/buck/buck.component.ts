import { ChangeDetectionStrategy, Component, inject, signal, type OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GoatService } from '../../../services/goat/goat.service';

@Component({
  selector: 'app-buck',
  templateUrl: './buck.component.html',
  styleUrl: './buck.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class BuckComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private goatService = inject(GoatService);

  index = signal(-1);
  bucks = this.goatService.bucks;
  setter = (index: number, buck: Record<string, unknown>) => this.goatService.setBuck(index, buck);
  async ngOnInit() {
    this.index.set(Number(this.route.snapshot.params['goat']));
  }
}
