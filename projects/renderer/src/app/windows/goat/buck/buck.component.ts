import { Component, type OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import type { Goat } from '../../../../../../shared/services/goat/goat.service';
import { GoatService } from '../../../services/goat/goat.service';

@Component({
  selector: 'app-buck',
  templateUrl: './buck.component.html',
  styleUrl: './buck.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class BuckComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private goatService = inject(GoatService);

  index = -1;
  bucks = this.goatService.bucks;
  setter = (index: number, buck: Goat) => this.goatService.setBuck(index, buck);
  async ngOnInit() {
    this.index = Number(this.route.snapshot.params['goat']);
  }
}
