import { Component, HostListener, signal, type OnInit } from '@angular/core';
import { DialogService } from '../../services/dialog/dialog.service';
import { GitService } from '../../services/git/git.service';
import { WindowService } from '../../services/window/window.service';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrl: './setup.component.scss'
})
export class SetupComponent implements OnInit {
  id = '';
  token = '';
  cloning = false;
  constructor(private gitService: GitService, private windowService: WindowService, private dialogService: DialogService) { }
  async setup() {
    this.cloning = true;
    try {
      await this.gitService.setup(this.id, this.token);
    } catch (error: unknown) {
      const message = (error as { message: string; }).message;
      if (message.includes('Could not resolve host: github.com')) {
        await this.dialogService.showMessageBox({ message: 'Clone Failed!', type: 'warning', detail: 'It Appears That Your Internet Connection Is Offline' });
      } else if (message.includes('.git/\' not found')) {
        await this.dialogService.showMessageBox({ message: 'Clone Failed!', type: 'warning', detail: 'Repository Not Found' });
      } else if (message.includes('The requested URL returned error: 403')) {
        await this.dialogService.showMessageBox({ message: 'Clone Failed!', type: 'warning', detail: 'Invalid Token' });
      } else {
        await this.dialogService.showMessageBox({ message: 'Clone Failed!', type: 'error', detail: message.split('fatal:').pop() });
      }
      console.error(error);
    } finally {
      setTimeout(this.windowService.close, 1000);
    }
  }
  async setupDemo() {
    this.id = 'beta-demo';
    this.token = '';
    await this.setup();
  }
  async setupBlank() {
    this.id = 'web-ui';
    this.token = '';
    await this.setup();
  }
  remoteProgress = signal(0);
  receivingProgress = signal(0);
  resolvingProgress = signal(0);
  completeThreshold = 90;
  ngOnInit() {
    this.gitService.onprogress = event => {
      if (event.method == 'clone') {
        switch (event.stage) {
          case 'remote:':
            this.remoteProgress.set(event.progress);
            break;
          case 'receiving':
            this.receivingProgress.set(event.progress);
            break;
          case 'resolving':
            this.resolvingProgress.set(event.progress);
            break;
        }
      }
    };
  }
  advanced = false;
  @HostListener('document:keydown', ['$event']) handleKeydownEvent(event: KeyboardEvent) {
    if (event.key === 'Alt') {
      this.advanced = true;
    }
  }
  @HostListener('document:keyup', ['$event']) handleKeyupEvent(event: KeyboardEvent) {
    if (event.key === 'Alt') {
      this.advanced = false;
    }
  }
}
