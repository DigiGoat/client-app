import { Component, type OnInit } from '@angular/core';
import { ADGAService } from '../../services/adga/adga.service';
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
  constructor(private adgaService: ADGAService, private windowService: WindowService) { }
  async login() {
    try {
      this.windowService.setClosable(false);
      this.status = 'Logging In...';
      const account = await this.adgaService.login(this.username, this.password, this.id);
      this.name = account.name;
      this.status = 'Success!';
      this.windowService.setClosable(true);
      setTimeout(this.windowService.close, 1000);
    } catch (e) {
      this.status = 'Login Failed';
      this.windowService.setClosable(true);
      setTimeout(() => this.status = 'Login', 2500);
    }
  }
  async ngOnInit() {
    const account = await this.adgaService.getAccount();
    this.username = account.username;
    this.password = account.password;
    this.id = account.id;
  }
}
