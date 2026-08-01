import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
  setter = (index: number, doe: Record<string, unknown>) => this.goatService.setDoe(index, doe);
  async ngOnInit() {
    this.index = Number(this.route.snapshot.params['goat']);
  }
}
