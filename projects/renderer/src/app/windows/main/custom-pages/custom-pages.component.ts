import { type CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import type { CustomPage } from '../../../../../../shared/services/custom-pages/custom-pages.service';
import { CustomPagesService } from '../../../services/custom-pages/custom-pages.service';
import { DialogService } from '../../../services/dialog/dialog.service';
import { WindowService } from '../../../services/window/window.service';

@Component({
  selector: 'app-custom-pages',
  standalone: false,
  templateUrl: './custom-pages.component.html',
  styleUrl: './custom-pages.component.scss'
})
export class CustomPagesComponent implements OnInit {
  customPages: CustomPage[] = [];
  constructor(private customPagesService: CustomPagesService, private dialogService: DialogService, private windowService: WindowService) { }
  ngOnInit(): void {
    this.customPagesService.getCustomPages().then(customPages => {
      this.customPages = customPages;
    });
    this.customPagesService.onCustomPagesChange = (customPages) => {
      this.customPages = customPages;
    };
  }
  rearrange(event: CdkDragDrop<CustomPage[]>) {
    this.customPagesService.rearrangeCustomPages(event);
  }
  async deleteCustomPage(event: MouseEvent, index: number) {
    event.stopPropagation();
    const action = await this.dialogService.showMessageBox({ message: `Are you sure you want to delete ${this.customPages[index].title || `Custom Page ${index + 1}`}?`, buttons: ['Yes', 'No'], type: 'warning' });
    if (action.response === 0) {
      await this.customPagesService.deleteCustomPage(index);
    }
  }
  async openCustomPage(index: number) {
    this.windowService.openCustomPage(index);
  }

  async addCustomPage() {
    const newPage: CustomPage = {};
    const openIndex = this.customPages.length;
    await this.customPagesService.addCustomPage(newPage);
    this.windowService.openCustomPage(openIndex);
  }
}
