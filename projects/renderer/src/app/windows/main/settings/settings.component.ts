import { Component, type OnInit } from '@angular/core';
import { ADGAService } from '../../../services/adga/adga.service';
import { AppService } from '../../../services/app/app.service';
import { GitService } from '../../../services/git/git.service';
import { RepoService } from '../../../services/repo/repo.service';
import { WindowService } from '../../../services/window/window.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  standalone: false
})
export class SettingsComponent implements OnInit {
  public appVersion: string = '';
  public webVersion: string = '';
  constructor(private windowService: WindowService, private adgaService: ADGAService, private appService: AppService, private repoService: RepoService, private gitService: GitService) { }
  async ngOnInit() {
    this.blacklist = (await this.adgaService.getBlacklist()).join('<br>');
    this.gitService.onchange = () => this.setVersionDetails();
    this.setVersionDetails();
  }
  async setVersionDetails() {
    this.appVersion = (await this.appService.getVersion()).version;
    this.webVersion = (await this.repoService.getVersion())!.version;
    if (!this.appVersion.includes('beta')) {
      this.webVersion = this.webVersion.split('-')[0];
    }
  }
  openLogin() {
    this.windowService.openLogin();
  }
  blacklist?: string;
  async openSetup() {
    await this.windowService.openSetup();
    await this.windowService.close();
  }
  async openOptimizer() {
    await this.windowService.openImageOptimizer();
  }
}
