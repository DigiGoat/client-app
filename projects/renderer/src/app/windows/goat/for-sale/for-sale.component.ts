import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GoatService } from '../../../services/goat/goat.service';

@Component({
  selector: 'app-for-sale',
  standalone: false,

  templateUrl: './for-sale.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './for-sale.component.scss'
})
export class ForSaleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private goatService = inject(GoatService);

  index = -1;
  references = this.goatService.forSale;
  setter = (index: number, goatForSale: Record<string, unknown>) => this.goatService.updateForSale(index, goatForSale);
  async ngOnInit() {
    this.index = Number(this.route.snapshot.params['goat']);
  }
}
