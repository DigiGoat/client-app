import { type CdkDragDrop } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CUSTOM_PAGE, CustomPagesService } from '../../../services/custom-pages/custom-pages.service';
import { DialogService } from '../../../services/dialog/dialog.service';
import { WindowService } from '../../../services/window/window.service';

@Component({
  selector: 'app-custom-pages',
  standalone: false,
  templateUrl: './custom-pages.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './custom-pages.component.scss'
})
export class CustomPagesComponent implements OnInit {
  private customPagesService = inject(CustomPagesService);
  private dialogService = inject(DialogService);
  private windowService = inject(WindowService);

  public loading = signal(true);

  customPages = signal<CUSTOM_PAGE[]>([]);
  ngOnInit(): void {
    this.customPagesService.getCustomPages().then(customPages => {
      this.customPages.set(customPages);
      this.loading.set(false);
    });
    this.customPagesService.onCustomPagesChange = (customPages) => {
      this.loading.set(true);
      this.customPages.set(customPages);
      this.loading.set(false);
    };
  }
  rearrange(event: CdkDragDrop<CUSTOM_PAGE[]>) {
    this.loading.set(true);
    this.customPagesService.rearrangeCustomPages(event);
  }
  async deleteCustomPage(event: MouseEvent, index: number) {
    event.stopPropagation();
    const action = await this.dialogService.showMessageBox({ message: `Are you sure you want to delete ${this.customPages()[index].title || `Custom Page ${index + 1}`}?`, buttons: ['Yes', 'No'], type: 'warning' });
    if (action.response === 0) {
      this.loading.set(true);
      await this.customPagesService.deleteCustomPage(index);
    }
  }
  async openCustomPage(index: number) {
    this.windowService.openCustomPage(index);
  }

  async addCustomPage() {
    this.loading.set(true);
    const newPage = CUSTOM_PAGE;
    const openIndex = this.customPages().length;
    await this.customPagesService.addCustomPage(newPage);
    this.windowService.openCustomPage(openIndex);
  }
}
