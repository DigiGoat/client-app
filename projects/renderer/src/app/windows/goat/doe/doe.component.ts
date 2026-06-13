import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import type { Goat } from '../../../../../../shared/services/goat/goat.service';
import { GoatService } from '../../../services/goat/goat.service';

@Component({
  selector: 'app-doe',
  templateUrl: './doe.component.html',
  styleUrl: './doe.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class DoeComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private goatService = inject(GoatService);

  index = -1;
  does = this.goatService.does;
  setter = (index: number, doe: Goat) => this.goatService.setDoe(index, doe);
  async ngOnInit() {
    this.index = Number(this.route.snapshot.params['goat']);
  }
}
