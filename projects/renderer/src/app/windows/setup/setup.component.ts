import { Component, HostListener, signal, type OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppService } from '../../services/app/app.service';
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
  payloadId?: string;
  payloadToken?: string;
  payloadName?: string;
  payloadEmail?: string;
  existingID?: string;
  existingToken?: string;
  existingName?: string;
  existingEmail?: string;
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
  constructor(private gitService: GitService, private windowService: WindowService, private dialogService: DialogService, private route: ActivatedRoute, private appService: AppService) { }
  async setup() {
    this.cloning = true;
    try {
      await this.gitService.setup(this.id || 'web-ui', this.name, this.email, this.token);
    } catch (error) {
      await this.gitService.handleError('Clone Failed!', error as Error);
    } finally {
      this.cloning = undefined;
      setTimeout(this.windowService.close, 1000);
    }
  }
  async updateSetup() {
    this.cloning = true;
    try {
      await this.gitService.updateSetup(this.id, this.name, this.email, this.token);
    } catch (error: unknown) {
      const message = (error as { message: string; }).message;
      await this.dialogService.showMessageBox({ message: 'Failed To Update!', type: 'error', detail: message.split('fatal:').pop() });
      console.error(error);
    } finally {
      this.cloning = undefined;
      this.windowService.close();
    }
  }
  remoteProgress = signal(0);
  receivingProgress = signal(0.5);
  resolvingProgress = signal(0.5);
  cloningProgress = signal('');
  async ngOnInit() {
    this.gitService.onprogress = event => {
      if (event.method == 'clone' || event.method == 'pull') {
        this.cloningProgress.set(`${event.processed}/${event.total}`);
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
    this.existingName = setup.name;
    this.existingEmail = setup.email;
    this.existingID = setup.repo;
    this.existingToken = setup.token;
    const payload = this.route.snapshot.queryParamMap.get('payload');
    if (payload) {
      // The payload is encrypted base64 JSON containing repo, token, name, and email. To decrypt all numbers are flipped (1 is 9, 2 is 8, etc)
      const decryptedPayload = payload.replace(/\d/g, (digit) => (9 - parseInt(digit)).toString());
      const urlPayload = JSON.parse(await this.appService.base64Decode(decryptedPayload));
      this.payloadId = urlPayload.repo;
      this.payloadToken = urlPayload.token;
      this.payloadName = urlPayload.name;
      this.payloadEmail = urlPayload.email;
    }

    this.id = this.payloadId || (this.existingID == 'web-ui' ? '' : this.existingID) || '';
    this.token = this.payloadToken || this.existingToken || '';
    this.name = this.existingName || this.payloadName || '';
    this.email = this.existingEmail || this.payloadEmail || '';
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
