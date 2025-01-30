import { Component } from '@angular/core';
import { DialogService } from '../../services/dialog/dialog.service';
import { GitService } from '../../services/git/git.service';
import { WindowService } from '../../services/window/window.service';

@Component({
  selector: 'app-git',
  templateUrl: './git.component.html',
  styleUrl: './git.component.scss',
  standalone: false
})
export class GitComponent {
  constructor(private gitService: GitService, private dialogService: DialogService, private windowService: WindowService) { }
  async installGit() {
    await this.gitService.install();
    await this.dialogService.showMessageBox({ message: 'Git Installation Started!', type: 'info', detail: 'Please Follow The Steps In The Window That Appears And Reopen Digi Goat When It Completes' });
    await this.windowService.quit();
  }
}
