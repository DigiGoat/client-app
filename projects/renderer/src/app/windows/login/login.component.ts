import { ChangeDetectionStrategy, Component, inject, signal, type OnInit } from '@angular/core';
import { ADGAService } from '../../services/adga/adga.service';
import { AppService } from '../../services/app/app.service';
import { DialogService } from '../../services/dialog/dialog.service';
import { DiffService } from '../../services/diff/diff.service';
import { WindowService } from '../../services/window/window.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class LoginComponent implements OnInit {
  private adgaService = inject(ADGAService);
  private windowService = inject(WindowService);
  private dialogService = inject(DialogService);
  private diffService = inject(DiffService);
  private appService = inject(AppService);

  username = signal('');
  password = signal('');
  id = signal<number | undefined>(undefined);
  status = signal<'Login' | 'Logging In...' | 'Login Failed' | 'Success!'>('Login');
  name = signal('');
  async login() {
    const passwordShowing = this.showPassword;
    try {
      this.windowService.setClosable(false);
      this.status.set('Logging In...');
      this.showPassword = false;
      const account = await this.adgaService.login(this.username(), this.password(), this.id());
      this.name.set(this.diffService.titleCase(account.name));
      this.status.set('Success!');
      this.windowService.setClosable(true);
      setTimeout(this.windowService.close, 1000);
    } catch (e) {
      this.status.set('Login Failed');
      this.windowService.setClosable(true);
      const message = (e as { message: string; }).message;
      if (message.includes('ETIMEDOUT')) {
        await this.dialogService.showMessageBox({ message: 'Login Failed!', type: 'warning', detail: 'The Connection Timed Out. Please Verify Your Internet Connection & Try Again' });
      } else if (message.includes('ENOTFOUND')) {
        await this.dialogService.showMessageBox({ message: 'Login Failed!', type: 'warning', detail: 'Failed To Connect. Please Verify Your Internet Connection & Try Again' });
      } else if (message.includes('Invalid Login ID Or Password')) {
        await this.dialogService.showMessageBox({ message: 'Login Failed!', type: 'warning', detail: 'Invalid Login ID or Password. Please Check Your Credentials & Try Again' });
      } else {
        await this.dialogService.showMessageBox({ message: 'Login Failed!', type: 'error', detail: message });

      }
      setTimeout(() => this.status.set('Login'), 2000);
    } finally {
      this.showPassword = passwordShowing;
    }
  }
  async logout() {
    await this.adgaService.logout();
    this.windowService.close();
  }
  async ngOnInit() {
    try {
      const account = await this.adgaService.getAccount();
      this.username.set(account?.username ?? '');
      this.password.set(account?.password ?? '');
      this.id.set(account?.id);
    } catch (e) {
      console.warn('Error Reading Account:', e);
    }
  }

  passwordShown = false;
  showPassword = false;
  async togglePassword() {
    if (!this.showPassword && !this.passwordShown) {
      const allowed = await this.appService.authenticate('show your ADGA password');
      if (allowed) {
        this.showPassword = true;
        this.passwordShown = true;
      }
    } else {
      this.showPassword = !this.showPassword;
    }
  }
}
