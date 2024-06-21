import { Component, type OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GoatService } from '../../../services/goat/goat.service';

@Component({
  selector: 'app-buck',
  templateUrl: './buck.component.html',
  styleUrl: './buck.component.scss'
})
export class BuckComponent implements OnInit {
  index = -1;
  bucks = this.goatService.bucks;
  setter = this.goatService.setBuck;
  constructor(private route: ActivatedRoute, private goatService: GoatService) {
  }
  async ngOnInit() {
    this.index = Number(this.route.snapshot.params['goat']);
  }
}
