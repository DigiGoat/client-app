import { ChangeDetectionStrategy, Component, effect, inject, signal, type OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppService } from '../../services/app/app.service';
import { DialogService } from '../../services/dialog/dialog.service';
import { GitService } from '../../services/git/git.service';
import { WindowService } from '../../services/window/window.service';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrl: './setup.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class SetupComponent implements OnInit {
  private gitService = inject(GitService);
  private windowService = inject(WindowService);
  private dialogService = inject(DialogService);
  private route = inject(ActivatedRoute);
  private appService = inject(AppService);

  id = signal('');
  token = signal('');
  name = signal('');
  email = signal('');
  payloadId = signal('');
  payloadToken = signal('');
  payloadName = signal('');
  payloadEmail = signal('');
  existingID = signal('');
  existingToken = signal('');
  existingName = signal('');
  existingEmail = signal('');
  cloning = signal(false);
  constructor() {
    effect(() => {
      this.windowService.setClosable(!this.cloning());
    });
  }
  dots = '';
  async setup() {
    this.cloning.set(true);
    try {
      await this.gitService.setup(this.id() || 'web-ui', this.name(), this.email(), this.token());
    } catch (error) {
      await this.gitService.handleError('Clone Failed!', error as Error);
    } finally {

      setTimeout(() => this.windowService.close(false, true), 1000);
    }
  }
  async updateSetup() {
    this.cloning.set(true);
    try {
      await this.gitService.updateSetup(this.id(), this.name(), this.email(), this.token());
    } catch (error: unknown) {
      const message = (error as { message: string; }).message;
      await this.dialogService.showMessageBox({ message: 'Failed To Update!', type: 'error', detail: message.split('fatal:').pop() });
      console.error(error);
    } finally {
      this.windowService.close(false, true);
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
    this.existingName.set(setup.name || '');
    this.existingEmail.set(setup.email || '');
    this.existingID.set(setup.repo || '');
    this.existingToken.set(setup.token || '');
    const payload = this.route.snapshot.queryParamMap.get('payload');
    if (payload) {
      // The payload is encrypted base64 JSON containing repo, token, name, and email. To decrypt all numbers are flipped (1 is 9, 2 is 8, etc)
      const decryptedPayload = payload.replace(/\d/g, (digit) => (9 - parseInt(digit)).toString());
      const urlPayload = JSON.parse(await this.appService.base64Decode(decryptedPayload));
      this.payloadId.set(urlPayload.repo);
      this.payloadToken.set(urlPayload.token);
      this.payloadName.set(urlPayload.name);
      this.payloadEmail.set(urlPayload.email);
    }

    this.id.set(this.payloadId() || (this.existingID() == 'web-ui' ? '' : this.existingID()) || '');
    this.token.set(this.payloadToken() || this.existingToken() || '');
    this.name.set(this.existingName() || this.payloadName() || '');
    this.email.set(this.existingEmail() || this.payloadEmail() || '');
  }
}
