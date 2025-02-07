import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import type { Goat } from '../../../../../../shared/services/goat/goat.service';
import { GoatService } from '../../../services/goat/goat.service';

@Component({
  selector: 'app-for-sale',
  standalone: false,

  templateUrl: './for-sale.component.html',
  styleUrl: './for-sale.component.scss'
})
export class ForSaleComponent implements OnInit {
  index = -1;
  references = this.goatService.forSale;
  setter = (index: number, goatForSale: Goat) => this.goatService.updateForSale(index, goatForSale);
  constructor(private route: ActivatedRoute, private goatService: GoatService) {
  }
  async ngOnInit() {
    this.index = Number(this.route.snapshot.params['goat']);
  }
}
