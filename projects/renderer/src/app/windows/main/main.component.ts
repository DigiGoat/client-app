import { ChangeDetectorRef, Component, signal, ViewEncapsulation, type OnInit } from '@angular/core';
import { DialogService } from '../../services/dialog/dialog.service';
import { GitService } from '../../services/git/git.service';
import { PreviewService } from '../../services/preview/preview.service';
import { StdioService } from '../../services/stdio/stdio.service';
import { WindowService } from '../../services/window/window.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
  encapsulation: ViewEncapsulation.None,
  standalone: false
})
export class MainComponent implements OnInit {
  changes = 0;
  constructor(private gitService: GitService, private cdr: ChangeDetectorRef, private dialogService: DialogService, private windowService: WindowService, private previewService: PreviewService, private stdioService: StdioService) {
  }

  async ngOnInit() {
    this.stdioService.pipeConsole();
    this.changes = (await this.gitService.getStatus()).ahead;
    this.gitService.onchange = async () => {
      this.changes = (await this.gitService.getStatus()).ahead;
      this.cdr.detectChanges();
    };
    this.gitService.onprogress = (event) => {
      if (event.method === 'push') {
        const stages = 5;
        const stage = 100 / stages;
        switch (event.stage) {
          case 'enumerating':
            this.publishProgress.set(event.progress / stages);
            break;
          case 'counting':
            this.publishProgress.set(stage + event.progress / stages);
            break;
          case 'compressing':
            this.publishProgress.set(stage * 2 + event.progress / stages);
            break;
          case 'writing':
            this.publishProgress.set(stage * 3 + event.progress / stages);
            break;
          case 'remote:':
            this.publishProgress.set(stage * 4 + event.progress / stages);
            break;
        }
      }
    };
    this.previewService.onprogress = (progress) => this.previewProgress.set(progress * 100);
    this.previewService.onchange = () => this.updatePreview();
    this.updatePreview();
  }
  publishing = false;
  publishProgress = signal(0);
  async publish() {
    this.publishing = true;
    this.publishProgress.set(5);
    if ((await this.gitService.getSetup()).token) {
      try {
        await this.gitService.push();
        this.publishProgress.set(100);
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
    setTimeout(() => {
      this.publishing = false;
    }, 1000);
  }
  async reset() {
    const action = await this.dialogService.showMessageBox({ message: 'Are you sure you want to reset?', detail: 'This will permanently reset ALL unpublished changes. This cannot be undone', type: 'warning', buttons: ['Reset Changes', 'Cancel'] });
    if (action.response === 0) {
      await this.gitService.reset();
      await this.windowService.refreshMain();
    }
  }

  previewStatus: 'loading' | 'active' | 'inactive' = 'inactive';
  previewProgress = signal(0);
  async togglePreview() {
    switch (this.previewStatus) {
      case 'active':
        await this.previewService.stopPreview();
        break;
      case 'inactive':
        await this.previewService.startPreview();
        break;
      case 'loading':
        this.previewService.stopPreview();
        break;
    }
  }
  async updatePreview() {
    this.previewStatus = await this.previewService.getPreviewActive() ? (await this.previewService.getPreviewVisible() ? 'active' : 'loading') : 'inactive';
    this.cdr.detectChanges();
  }
}
