import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GoatService } from '../../../services/goat/goat.service';

@Component({
  selector: 'app-doe',
  templateUrl: './doe.component.html',
  styleUrl: './doe.component.scss'
})
export class DoeComponent implements OnInit {
  index = -1;
  does = this.goatService.does;
  setter = this.goatService.setDoe;
  constructor(private route: ActivatedRoute, private goatService: GoatService) {
  }
  async ngOnInit() {
    this.index = Number(this.route.snapshot.params['goat']);
  }
}
