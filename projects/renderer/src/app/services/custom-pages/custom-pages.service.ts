import { type CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Injectable } from '@angular/core';
import type { CustomPage } from '../../../../../shared/services/custom-pages/custom-pages.service';
import { DiffService } from '../diff/diff.service';
import { GitService } from '../git/git.service';

@Injectable({
  providedIn: 'root'
})
export class CustomPagesService {

  constructor(private gitService: GitService, private diffService: DiffService) { }

  getCustomPages = window.electron.customPages.getCustomPages;

  async setCustomPage(index: number, customPage: CustomPage) {
    const customPages = await this.getCustomPages();
    const diffMessage = this.diffService.commitMsg(customPages[index], customPage);
    customPages[index] = customPage;
    await window.electron.customPages.setCustomPages(customPages);
    await this.gitService.commitCustomPages([`Updated Custom Page: ${customPage.title || `Custom Page ${index + 1}`}`, ...diffMessage]);
  }
  async deleteCustomPage(index: number) {
    const customPages = await this.getCustomPages();
    const customPage = customPages.splice(index, 1)[0];
    await window.electron.customPages.setCustomPages(customPages);
    await this.gitService.commitCustomPages([`Deleted Custom Page: ${customPage.title || `Custom Page ${index + 1}`}`]);
  }
  async addCustomPage(customPage: CustomPage) {
    const customPages = await this.getCustomPages();
    customPages.push(customPage);
    await window.electron.customPages.setCustomPages(customPages);
    await this.gitService.commitCustomPages([`Added Custom Page: ${customPage.title || `Custom Page ${customPages.length}`}`]);
  }
  async rearrangeCustomPages(event: CdkDragDrop<CustomPage[]>) {
    const customPages = await this.getCustomPages();
    moveItemInArray(customPages, event.previousIndex, event.currentIndex);
    const customPage = customPages[event.currentIndex];
    await window.electron.customPages.setCustomPages(customPages);
    await this.gitService.commitCustomPages([`Moved Custom Page: ${customPage.title || `Custom Page ${event.currentIndex + 1}`} ${event.previousIndex > event.currentIndex ? 'Up' : 'Down'} ${Math.abs(event.previousIndex - event.currentIndex)} Position${Math.abs(event.previousIndex - event.currentIndex) > 1 ? 's' : ''}`]);
  }

  set onCustomPagesChange(callback: (customPages: CustomPage[]) => void) {
    window.electron.customPages.onCustomPagesChange(callback);
  }
}
