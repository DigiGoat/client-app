import { Component, HostListener, signal, type OnInit } from '@angular/core';
import { DialogService } from '../../services/dialog/dialog.service';
import { GitService } from '../../services/git/git.service';
import { WindowService } from '../../services/window/window.service';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrl: './setup.component.scss',
  standalone: false
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
    } catch (error) {
      await this.gitService.handleError('Clone Failed!', error as Error);
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
    this.cloning = true;
    try {
      await this.gitService.setupDemo();
    } catch (error) {
      await this.gitService.handleError('Clone Failed!', error as Error);
    } finally {
      this.cloning = undefined;
      setTimeout(this.windowService.close, 1000);
    }
  }
  async setupBlank() {
    this.cloning = true;
    try {
      await this.gitService.setupBlank();
    } catch (error) {
      await this.gitService.handleError('Clone Failed!', error as Error);
    } finally {
      this.cloning = undefined;
      setTimeout(this.windowService.close, 1000);
    }
  }
  remoteProgress = signal(0);
  receivingProgress = signal(0.5);
  resolvingProgress = signal(0.5);
  async ngOnInit() {
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
    const setup = await this.gitService.getSetup();
    this.name = setup.name || '';
    this.email = setup.email || '';
    this.id = setup.repo || '';
    this.token = setup.token || '';
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
