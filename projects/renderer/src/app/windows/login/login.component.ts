import { Component, type OnInit } from '@angular/core';
import { ADGAService } from '../../services/adga/adga.service';
import { DialogService } from '../../services/dialog/dialog.service';
import { DiffService } from '../../services/diff/diff.service';
import { WindowService } from '../../services/window/window.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  username = '';
  password = '';
  id?: number;
  status: 'Login' | 'Logging In...' | 'Login Failed' | 'Success!' = 'Login';
  name?: string;
  constructor(private adgaService: ADGAService, private windowService: WindowService, private dialogService: DialogService, private diffService: DiffService) { }
  async login() {
    try {
      this.windowService.setClosable(false);
      this.status = 'Logging In...';
      const account = await this.adgaService.login(this.username, this.password, this.id);
      this.name = this.diffService.titleCase(account.name);
      this.status = 'Success!';
      this.windowService.setClosable(true);
      setTimeout(this.windowService.close, 1000);
    } catch (e) {
      this.status = 'Login Failed';
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
      setTimeout(() => this.status = 'Login', 2000);
    }
  }
  async logout() {
    await this.adgaService.logout();
    this.windowService.close();
  }
  async ngOnInit() {
    try {
      const account = await this.adgaService.getAccount();
      this.username = account.username;
      this.password = account.password;
      this.id = account.id;
    } catch (e) {
      console.warn('Error Reading Account:', e);
    }
  }
}
