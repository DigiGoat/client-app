import { Component, type OnInit } from '@angular/core';
import { GitService } from './services/git/git.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  info?: { installed: boolean; version: string; };
  isRepo?: boolean;
  async initRepo() {
    await this.gitService.init();
    this.gitService.getInfo().then(info => this.info = info);
    this.gitService.isRepo().then(isRepo => this.isRepo = isRepo);
  }
  constructor(private gitService: GitService) { }
  ngOnInit(): void {
    this.gitService.getInfo().then(info => this.info = info);
    this.gitService.isRepo().then(isRepo => this.isRepo = isRepo);
  }
}
