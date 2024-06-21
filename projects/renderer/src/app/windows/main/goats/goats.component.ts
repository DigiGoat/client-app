import { Component } from '@angular/core';
import { GoatService } from '../../../services/goat/goat.service';

@Component({
  selector: 'app-goats',
  templateUrl: './goats.component.html',
  styleUrl: './goats.component.scss'
})
export class GoatsComponent {
  does = this.goatService.does;
  constructor(private goatService: GoatService) { }
}
