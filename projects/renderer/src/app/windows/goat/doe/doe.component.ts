import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import type { Goat } from '../../../../../../shared/services/goat/goat.service';
import { GoatService } from '../../../services/goat/goat.service';

@Component({
  selector: 'app-doe',
  templateUrl: './doe.component.html',
  styleUrl: './doe.component.scss',
  standalone: false
})
export class DoeComponent implements OnInit {
  index = -1;
  does = this.goatService.does;
  setter = (index: number, doe: Goat) => this.goatService.setDoe(index, doe);
  constructor(private route: ActivatedRoute, private goatService: GoatService) {
  }
  async ngOnInit() {
    this.index = Number(this.route.snapshot.params['goat']);
  }
}
