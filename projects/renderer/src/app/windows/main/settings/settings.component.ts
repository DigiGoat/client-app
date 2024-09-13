import { Component, type OnInit } from '@angular/core';
import { ADGAService } from '../../../services/adga/adga.service';
import { WindowService } from '../../../services/window/window.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  constructor(private windowService: WindowService, private adgaService: ADGAService) { }
  async ngOnInit() {
    this.blacklist = (await this.adgaService.getBlacklist()).join('<br>');
  }
  openLogin() {
    this.windowService.openLogin();
  }
  blacklist?: string;
  async openSetup() {
    await this.windowService.openSetup();
    await this.windowService.close();
  }
}
