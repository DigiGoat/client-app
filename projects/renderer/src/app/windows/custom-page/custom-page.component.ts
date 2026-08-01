import { ChangeDetectionStrategy, Component, computed, inject, signal, type OnInit } from '@angular/core';
import { form, readonly } from '@angular/forms/signals';
import { ActivatedRoute } from '@angular/router';
import type { CustomPage } from '../../../../../shared/services/custom-pages/custom-pages.service';
import { CUSTOM_PAGE, CustomPagesService } from '../../services/custom-pages/custom-pages.service';
import { DiffService } from '../../services/diff/diff.service';
import { WindowService } from '../../services/window/window.service';
import { SaveableStrategy } from '../../strategies/saveable/saveable.strategy';

@Component({
  selector: 'app-custom-page',
  standalone: false,
  templateUrl: './custom-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './custom-page.component.scss'
})
export class CustomPageComponent extends SaveableStrategy implements OnInit {
  private route = inject(ActivatedRoute);
  private customPagesService = inject(CustomPagesService);
  private windowService = inject(WindowService);
  private diffService = inject(DiffService);

  public index = signal(-1);
  private loading = signal(true);
  private savedCustomPage = signal(CUSTOM_PAGE);
  private customPageModel = signal(CUSTOM_PAGE);
  public customPageForm = form(this.customPageModel, form => {
    readonly(form, { when: () => this.loading() });
  });
  public savedCustomPages = signal;
  public customPage = signal<CustomPage>({});
  ngOnInit() {
    this.index.set(Number(this.route.snapshot.params['custom-page']));
    this.customPagesService.getCustomPages().then(customPages => {
      this.savedCustomPage.set(customPages[this.index()] || CUSTOM_PAGE);
      this.customPageModel.set(customPages[this.index()] || CUSTOM_PAGE);
      this.customPageForm().reset();
      this.loading.set(false);
    });
    this.customPagesService.onCustomPagesChange = customPages => {
      this.loading.set(true);
      this.savedCustomPage.set(customPages[this.index()] || CUSTOM_PAGE);
      this.customPageModel.set(customPages[this.index()] || CUSTOM_PAGE);
      this.customPageForm().reset();
      this.loading.set(false);
    };
  }
  dirtyFields = computed(() => {
    return this.diffService.diff(this.savedCustomPage(), this.customPageForm().value()) as Partial<CUSTOM_PAGE>;
  });
  override unsavedChanges = computed(() => Object.keys(this.dirtyFields()).length > 0);
  override saveChanges = async () => {
    await this.customPagesService.setCustomPage(this.index(), this.customPageForm().value());
  };
}
