import { ChangeDetectionStrategy, Component, inject, signal, ViewEncapsulation, type OnInit } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class MainComponent implements OnInit {
  private gitService = inject(GitService);
  private dialogService = inject(DialogService);
  private windowService = inject(WindowService);
  private previewService = inject(PreviewService);
  private stdioService = inject(StdioService);

  localChanges = signal(0);
  remoteChanges = signal(0);

  async ngOnInit() {
    this.stdioService.pipeConsole();
    const status = await this.gitService.getStatus();
    this.localChanges.set(status.ahead);
    this.remoteChanges.set(status.behind);
    this.gitService.onchange = async () => {
      const status = await this.gitService.getStatus();
      this.localChanges.set(status.ahead);
      this.remoteChanges.set(status.behind);
    };
    this.gitService.onprogress = (event) => {
      if (event.method === 'push') {
        this.publishStatus.set(`${event.stage.charAt(0).toUpperCase() + event.stage.slice(1)} ${event.processed}/${event.total}`);
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
  publishing = signal(false);
  publishProgress = signal(0);
  publishStatus = signal('');
  async publish() {
    this.publishing.set(true);
    this.publishProgress.set(5);
    if ((await this.gitService.getSetup()).token) {
      try {
        await this.gitService.publish();
        this.publishProgress.set(100);
      } catch (err) {
        console.warn(err);
        await this.gitService.handleError('Publish Failed!', err as Error);
      } finally {
        this.publishStatus.set('');
      }
    } else {
      const action = await this.dialogService.showMessageBox({ message: 'No Access Token Configured!', type: 'warning', detail: 'Please Configure A Access Token Before Publishing', buttons: ['Open Setup', 'Cancel'] });
      if (action.response === 0) {
        await this.windowService.openSetup();
        await this.windowService.close();
      }
    }
    setTimeout(() => {
      this.publishing.set(false);
    }, 1000);
  }
  async reset() {
    const action = await this.dialogService.showMessageBox({ message: 'Are you sure you want to reset?', detail: 'This will permanently reset ALL unpublished changes. This cannot be undone', type: 'warning', buttons: ['Reset Changes', 'Cancel'] });
    if (action.response === 0) {
      await this.gitService.reset();
      await this.windowService.refreshMain();
    }
  }

  previewStatus = signal<'loading' | 'active' | 'inactive' | 'starting'>('inactive');
  previewProgress = signal(0);
  async togglePreview() {
    switch (this.previewStatus()) {
      case 'active':
      case 'starting':
      case 'loading':
        await this.previewService.stopPreview();
        break;
      case 'inactive':
        await this.previewService.startPreview();
        this.previewStatus.set('loading');
        this.previewProgress.set(0);
        break;
    }
  }
  async updatePreview() {
    this.previewStatus.set(await this.previewService.getPreviewActive() ? (await this.previewService.getPreviewVisible() ? 'active' : (await this.previewService.getPreviewCloseable() ? 'starting' : 'loading')) : 'inactive');
  }
}
