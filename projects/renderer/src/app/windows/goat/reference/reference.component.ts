import { Component, type OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import type { Goat } from '../../../../../../shared/services/goat/goat.service';
import { GoatService } from '../../../services/goat/goat.service';

@Component({
  selector: 'app-reference',
  templateUrl: './reference.component.html',
  styleUrl: './reference.component.scss',
  standalone: false
})
export class ReferenceComponent implements OnInit {
  index = -1;
  references = this.goatService.references;
  setter = (index: number, reference: Goat) => this.goatService.setReference(index, reference);
  constructor(private route: ActivatedRoute, private goatService: GoatService) {
  }
  async ngOnInit() {
    this.index = Number(this.route.snapshot.params['goat']);
  }
}
