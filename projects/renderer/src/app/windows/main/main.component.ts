import { ChangeDetectorRef, Component, ViewEncapsulation, type OnInit } from '@angular/core';
import { DialogService } from '../../services/dialog/dialog.service';
import { GitService } from '../../services/git/git.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class MainComponent implements OnInit {
  changes = 0;
  constructor(private gitService: GitService, private cdr: ChangeDetectorRef, private dialogService: DialogService) { }

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
    const action = await this.dialogService.showMessageBox({ message: 'Are you sure you want to reset?', detail: 'This will permanently reset ALL unpublished changes. This cannot be undone', type: 'warning', buttons: ['Reset Changes', 'Cancel'] });
    if (action.response === 0) {
      await this.gitService.reset();
    }
  }
}
