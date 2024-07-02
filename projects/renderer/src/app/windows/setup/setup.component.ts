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
  name = '';
  email = '';
  _cloning = false;
  set cloning(cloning: boolean | undefined) {
    if (cloning !== undefined) {
      this._cloning = cloning;
    }
    this.windowService.setClosable(!cloning);
  }
  get cloning() {
    return this._cloning;
  }
  dots = '';
  constructor(private gitService: GitService, private windowService: WindowService, private dialogService: DialogService) { }
  async setup() {
    this.cloning = true;
    try {
      await this.gitService.setup(this.id, this.name, this.email, this.token);
    } catch (error: unknown) {
      const message = (error as { message: string; }).message;
      if (message.includes('Could not resolve host: github.com')) {
        await this.dialogService.showMessageBox({ message: 'Clone Failed!', type: 'warning', detail: 'It Appears That Your Internet Connection Is Offline' });
      } else if (message.includes('.git/\' not found')) {
        await this.dialogService.showMessageBox({ message: 'Clone Failed!', type: 'warning', detail: 'Repository Not Found' });
      } else if (message.includes('The requested URL returned error: 403')) {
        await this.dialogService.showMessageBox({ message: 'Clone Failed!', type: 'warning', detail: 'Invalid Token' });
      } else if (message.includes('invalid index-pack output') || message.includes('Couldn\'t connect to server')) {
        await this.dialogService.showMessageBox({ message: 'Clone Failed!', type: 'error', detail: 'The Connection Timed Out. Please Verify Your Internet Connection & Try Again' });
      } else {
        await this.dialogService.showMessageBox({ message: 'Clone Failed!', type: 'error', detail: message.split('fatal:').pop() });
      }
      console.error(error);
    } finally {
      this.cloning = undefined;
      setTimeout(this.windowService.close, 1000);
    }
  }
  async updateSetup() {
    try {
      await this.gitService.updateSetup(this.id, this.name, this.email, this.token);
    } catch (error: unknown) {
      const message = (error as { message: string; }).message;
      await this.dialogService.showMessageBox({ message: 'Failed To Update!', type: 'error', detail: message.split('fatal:').pop() });
      console.error(error);
    } finally {
      this.windowService.close();
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
  receivingProgress = signal(0.5);
  resolvingProgress = signal(0.5);
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
    setInterval(() => {
      if (this.dots.length > 2) {
        this.dots = '';
      } else {
        this.dots += '.';
      }
    }, 500);
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
