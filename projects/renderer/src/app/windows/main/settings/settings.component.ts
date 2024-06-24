import { Component } from '@angular/core';
import { WindowService } from '../../../services/window/window.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  constructor(private windowService: WindowService) { }
  openLogin() {
    this.windowService.openLogin();
  }
}
