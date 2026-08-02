import { ChangeDetectionStrategy, Component, inject, signal, type OnInit } from '@angular/core';
import { ADGAService } from '../../../services/adga/adga.service';
import { AppService } from '../../../services/app/app.service';
import { GitService } from '../../../services/git/git.service';
import { RepoService } from '../../../services/repo/repo.service';
import { WindowService } from '../../../services/window/window.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class SettingsComponent implements OnInit {
  private windowService = inject(WindowService);
  private adgaService = inject(ADGAService);
  private appService = inject(AppService);
  private repoService = inject(RepoService);
  private gitService = inject(GitService);

  public appVersion = signal('');
  public webVersion = signal('');
  async ngOnInit() {
    this.blacklist.set((await this.adgaService.getBlacklist()).join('<br>'));
    this.gitService.onchange = () => this.setVersionDetails();
    this.setVersionDetails();
  }
  async setVersionDetails() {
    this.appVersion.set((await this.appService.getVersion()).version);
    this.webVersion.set((await this.repoService.getVersion())!.version);
    if (!this.appVersion().includes('beta')) {
      this.webVersion.set(this.webVersion().split('-')[0]);
    }
  }
  openLogin() {
    this.windowService.openLogin();
  }
  blacklist = signal('');
  async openSetup() {
    await this.windowService.openSetup();
    await this.windowService.close();
  }
  async openOptimizer() {
    await this.windowService.openImageOptimizer();
  }
  async openSettings() {
    await this.windowService.openSettings();
  }
}
