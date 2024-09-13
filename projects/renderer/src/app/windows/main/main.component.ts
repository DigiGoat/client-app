import { ChangeDetectorRef, Component, signal, ViewEncapsulation, type OnInit } from '@angular/core';
import { DialogService } from '../../services/dialog/dialog.service';
import { GitService } from '../../services/git/git.service';
import { WindowService } from '../../services/window/window.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class MainComponent implements OnInit {
  changes = 0;
  constructor(private gitService: GitService, private cdr: ChangeDetectorRef, private dialogService: DialogService, private windowService: WindowService) { }

  async ngOnInit() {
    this.changes = (await this.gitService.getStatus()).ahead;
    this.gitService.onchange = async () => {
      this.changes = (await this.gitService.getStatus()).ahead;
      this.cdr.detectChanges();
    };
    this.gitService.onprogress = (event) => {
      if (event.method === 'push') {
        switch (event.stage) {
          case 'counting':
            this.publishProgress.set(event.progress / 25);
            break;
          case 'compressing':
            this.publishProgress.set(25 + event.progress / 25);
            break;
          case 'writing':
            this.publishProgress.set(50 + event.progress / 25);
            break;
          case 'remote:':
            this.publishProgress.set(75 + event.progress / 25);
            break;
        }
      }
    };
  }
  publishing = false;
  publishProgress = signal(0);
  async publish() {
    this.publishing = true;
    this.publishProgress.set(5);
    if ((await this.gitService.getSetup()).token) {
      try {
        await this.gitService.push();
      } catch (err) {
        console.warn(err);
        await this.gitService.handleError('Publish Failed!', err as Error);
      }
    } else {
      const action = await this.dialogService.showMessageBox({ message: 'No Access Token Configured!', type: 'warning', detail: 'Please Configure A Access Token Before Publishing', buttons: ['Open Setup', 'Cancel'] });
      if (action.response === 0) {
        await this.windowService.openSetup();
        await this.windowService.close();
      }
    }
    this.publishing = false;
    this.publishProgress.set(0);
  }
  async reset() {
    const action = await this.dialogService.showMessageBox({ message: 'Are you sure you want to reset?', detail: 'This will permanently reset ALL unpublished changes. This cannot be undone', type: 'warning', buttons: ['Reset Changes', 'Cancel'] });
    if (action.response === 0) {
      await this.gitService.reset();
      await this.windowService.refreshMain();
    }
  }
}
