import { ChangeDetectorRef, Component, type OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import type { CustomPage } from '../../../../../shared/services/custom-pages/custom-pages.service';
import { CustomPagesService } from '../../services/custom-pages/custom-pages.service';
import { DialogService } from '../../services/dialog/dialog.service';
import { DiffService } from '../../services/diff/diff.service';
import { WindowService } from '../../services/window/window.service';

@Component({
  selector: 'app-custom-page',
  standalone: false,
  templateUrl: './custom-page.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './custom-page.component.scss'
})
export class CustomPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private customPagesService = inject(CustomPagesService);
  private windowService = inject(WindowService);
  private dialogService = inject(DialogService);
  private cdr = inject(ChangeDetectorRef);
  private diffService = inject(DiffService);

  index = -1;
  private customPages: CustomPage[] = [];
  public customPage: CustomPage = {};
  ngOnInit() {
    this.index = Number(this.route.snapshot.params['custom-page']);

    this.windowService.setUnsavedChanges(false);
    this.customPagesService.getCustomPages().then(customPages => {
      this.customPages = customPages;
      this.customPage = structuredClone(this.customPages[this.index] || {});
    });
    this.windowService.onsave = async () => {
      const action = (await this.dialogService.showMessageBox({ message: 'Unsaved Changes!', detail: 'Would you like to continue anyway?', buttons: ['Save Changes', 'Close Without Saving', 'Cancel'], defaultId: 0 })).response;
      switch (action) {
        case 0:
          await this.customPagesService.setCustomPage(this.index, this.customPage);
          await this.windowService.setUnsavedChanges(false);
          await this.windowService.close();
          break;
        case 1:
          await this.windowService.close(true);
          break;
      }
    };
  }
  detectChanges() {
    this.windowService.setTitle(this.customPage.title || '');
    this.windowService.setUnsavedChanges(this.unsavedChanges);
  }
  get unsavedChangesDiff() {
    return this.diffService.diff(this.customPages[this.index], this.customPage) as Record<string, string>;
  }
  isDirty(parameter: string) {
    return (parameter in this.unsavedChangesDiff);
  }
  get unsavedChanges() {
    return !!Object.keys(this.unsavedChangesDiff).length;
  }
}
