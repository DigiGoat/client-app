import { Component } from '@angular/core';
import { GitService } from '../../services/git/git.service';
import { WindowService } from '../../services/window/window.service';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrl: './setup.component.scss'
})
export class SetupComponent {
  id = '';
  token = '';
  cloning = false;
  constructor(private gitService: GitService, private windowService: WindowService) { }
  async setup() {
    this.cloning = true;
    await this.gitService.setup(this.id, this.token);
    this.cloning = false;
    //await this.windowService.openMain();
    await this.windowService.close();
  }
  async setupDemo() {
    this.id = 'beta-demo';
    this.token = '';
    await this.setup();
  }
}
