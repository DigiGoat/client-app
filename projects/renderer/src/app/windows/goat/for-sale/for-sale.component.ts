import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GoatService } from '../../../services/goat/goat.service';

@Component({
  selector: 'app-for-sale',
  standalone: false,

  templateUrl: './for-sale.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './for-sale.component.scss'
})
export class ForSaleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private goatService = inject(GoatService);

  index = signal(-1);
  references = this.goatService.forSale;
  setter = (index: number, goatForSale: Record<string, unknown>) => this.goatService.updateForSale(index, goatForSale);
  async ngOnInit() {
    this.index.set(Number(this.route.snapshot.params['goat']));
  }
}
