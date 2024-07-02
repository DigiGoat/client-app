import { Component, ViewEncapsulation, ChangeDetectorRef, type OnInit } from '@angular/core';
import { GitService } from '../../services/git/git.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class MainComponent implements OnInit {
  changes = 0;
  constructor(private gitService: GitService, private cdr: ChangeDetectorRef) { }

  async ngOnInit() {
    this.changes = (await this.gitService.getStatus()).ahead;
    this.gitService.onchange = async () => {
      this.changes = (await this.gitService.getStatus()).ahead;
      this.cdr.detectChanges();
    };
  }
  publishing = false;
  async publish() {
    this.publishing = true;
    await this.gitService.push();
    this.publishing = false;
  }
  async reset() {
    await this.gitService.reset();
  }
}
