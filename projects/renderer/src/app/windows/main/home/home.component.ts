import { Component } from '@angular/core';
import { WindowService } from '../../../services/window/window.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  constructor(private windowService: WindowService) { }
  async openSetup() {
    await this.windowService.openSetup();
    await this.windowService.close();
  }
}
