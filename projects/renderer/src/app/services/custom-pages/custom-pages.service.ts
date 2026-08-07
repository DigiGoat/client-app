import { type CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Injectable, inject } from '@angular/core';
import { DiffService } from '../diff/diff.service';
import { GitService } from '../git/git.service';

@Injectable({
  providedIn: 'root'
})
export class CustomPagesService {
  private gitService = inject(GitService);
  private diffService = inject(DiffService);




  getCustomPages = async () => (await window.electron.customPages.getCustomPages()).map(customPage => this.parseCustomPage(customPage));

  parseCustomPage = (customPage: Record<string, string>): CUSTOM_PAGE => ({
    ...CUSTOM_PAGE,
    title: customPage['title'],
    content: customPage['content']
  });
  async setCustomPage(index: number, customPage: CUSTOM_PAGE) {
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
  async addCustomPage(customPage: CUSTOM_PAGE) {
    const customPages = await this.getCustomPages();
    customPages.push(customPage);
    await window.electron.customPages.setCustomPages(customPages);
    await this.gitService.commitCustomPages([`Added Custom Page: ${customPage.title || `Custom Page ${customPages.length}`}`]);
  }
  async rearrangeCustomPages(event: CdkDragDrop<CUSTOM_PAGE[]>) {
    const customPages = await this.getCustomPages();
    moveItemInArray(customPages, event.previousIndex, event.currentIndex);
    const customPage = customPages[event.currentIndex];
    await window.electron.customPages.setCustomPages(customPages);
    await this.gitService.commitCustomPages([`Moved Custom Page: ${customPage.title || `Custom Page ${event.currentIndex + 1}`} ${event.previousIndex > event.currentIndex ? 'Up' : 'Down'} ${Math.abs(event.previousIndex - event.currentIndex)} Position${Math.abs(event.previousIndex - event.currentIndex) > 1 ? 's' : ''}`]);
  }

  set onCustomPagesChange(callback: (customPages: CUSTOM_PAGE[]) => void) {
    window.electron.customPages.onCustomPagesChange(pages => callback(pages.map(page => this.parseCustomPage(page))));
  }
}

export type CUSTOM_PAGE = typeof CUSTOM_PAGE;
export const CUSTOM_PAGE = {
  title: '',
  content: ''
};