import { booleanAttribute, ChangeDetectionStrategy, Component, computed, inject, Input, signal, ViewChild, type ElementRef, type OnInit } from '@angular/core';
import { disabled, form, readonly } from '@angular/forms/signals';
import type { Observable } from 'rxjs';
import { ADGAService } from '../../../../services/adga/adga.service';
import { DiffService } from '../../../../services/diff/diff.service';
import { GOAT } from '../../../../services/goat/goat.service';
import { SaveableStrategy } from '../../../../strategies/saveable/saveable.strategy';

type Goat = Pick<GOAT, 'name' | 'normalizeId' | 'nickname' | 'price' | 'id' | 'sex' | 'dateOfBirth' | 'dateOfDeath' | 'damId' | 'sireId' | 'usdaId' | 'usdaKey' | 'linearAppraisals' | 'awards' | 'lactationRecords' | 'owner' | 'pet' | 'tattoos' | 'colorAndMarking' | 'description'>;
@Component({
  selector: 'app-goat',
  templateUrl: './goat.component.html',
  styleUrl: './goat.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class GoatComponent extends SaveableStrategy implements OnInit {
  private diffService = inject(DiffService);
  private adgaService = inject(ADGAService);

  @Input({ required: true }) getter!: Observable<Goat[]>;
  @Input({ required: true }) index!: number;
  @Input({ required: true }) setter!: (index: number, goat: Goat) => Promise<void>;
  @Input({ transform: booleanAttribute }) related = false;
  @Input({ transform: booleanAttribute, alias: 'for-sale' }) forSale = false;

  private loading = signal(true);
  private savedGoat = signal(GOAT as Goat);
  private goatModel = signal(GOAT as Goat);
  public goatForm = form(this.goatModel, form => {
    readonly(form, { when: () => this.loading() });
    disabled(form.name, { when: ({ valueOf }) => !!valueOf(form.id) });
    disabled(form.dateOfBirth, { when: ({ valueOf }) => !!valueOf(form.id) });
    disabled(form.dateOfDeath, { when: ({ valueOf }) => !!valueOf(form.id) });
    disabled(form.normalizeId, { when: ({ valueOf }) => !!valueOf(form.id) });
    disabled(form.sex, { when: ({ valueOf }) => !!valueOf(form.id) });
    disabled(form.damId, { when: ({ valueOf }) => !!valueOf(form.id) });
    disabled(form.sireId, { when: ({ valueOf }) => !!valueOf(form.id) });
  });

  dirtyFields = computed(() => {
    return this.diffService.diff(this.savedGoat(), this.goatForm().value()) as Partial<Goat>;
  });
  override unsavedChanges = computed(() => Object.keys(this.dirtyFields()).length > 0);
  override saveChanges = async () => {
    await this.setter(this.index, this.goatForm().value());
  };

  ngOnInit() {
    this.getter.subscribe({
      next: goats => {
        this.savedGoat.set(goats[this.index] ?? GOAT);
        if (this.loading()) {
          this.goatModel.set(this.savedGoat());
        }
        this.goatForm().reset();
        this.loading.set(false);
      }
    });
  }
  /* ------------------------------ Sync Handlers ------------------------------*/
  @ViewChild('dropdown') dropdown!: ElementRef<HTMLUListElement>;
  @ViewChild('dropdownButton') dropdownButton!: ElementRef<HTMLButtonElement>;
  async syncAll() {
    let shown = false;
    if (!this.dropdown.nativeElement.classList.contains('show')) {
      this.dropdownButton.nativeElement.click();
    } else {
      shown = true;
    }
    await Promise.all([this.syncDetails(), this.syncLA(), this.syncLactations(), this.syncAwards()]);
    if (this.dropdown.nativeElement.classList.contains('show')) {
      if (!shown) {
        this.dropdownButton.nativeElement.click();
      } else {
        this.dropdownButton.nativeElement.click();
        this.dropdownButton.nativeElement.click();
      }
    }
  }
  syncingDetails = false;
  async syncDetails() {
    this.syncingDetails = true;
    try {
      const goat = (this.related ? (await this.adgaService.getGoats([this.goatForm.id().value()]))[0] : await this.adgaService.getGoat(this.goatForm.id().value()));
      this.goatForm().value.set(this.diffService.softMerge(this.goatForm().value(), goat));
    } catch (error) {
      await this.adgaService.handleError(error as Error, 'Error Syncing Details!');
    } finally {
      this.syncingDetails = false;
    }
  }
  syncingLA = false;
  async syncLA() {
    this.syncingLA = true;
    try {
      const linear = await this.adgaService.getLinearAppraisal(this.goatForm.id().value());
      this.goatForm.linearAppraisals().value.set(linear || []);
    } catch (error) {
      await this.adgaService.handleError(error as Error, 'Error Syncing Linear Appraisal!');
    } finally {
      this.syncingLA = false;
    }
  }
  syncingLactations = false;
  async syncLactations() {
    this.syncingLactations = true;
    try {
      if (!this.goatForm.usdaId().value() || !this.goatForm.usdaKey().value()) {
        const cdcbGoat = await this.adgaService.getCDCBGoat(this.goatForm.normalizeId().value());
        if (!cdcbGoat) {
          return;
        }
        this.goatForm.usdaId().value.set(cdcbGoat.animalId);
        this.goatForm.usdaKey().value.set(cdcbGoat.animKey);
      }
      const lactationRecords = await this.adgaService.getLactations(this.goatForm.usdaId().value(), this.goatForm.usdaKey().value());
      this.goatForm.lactationRecords().value.set(lactationRecords);
    } catch (error) {
      await this.adgaService.handleError(error as Error, 'Error Syncing Lactations!');
    } finally {
      this.syncingLactations = false;
    }
  }
  syncingAwards = false;
  async syncAwards() {
    this.syncingAwards = true;
    try {
      const awards = await this.adgaService.getAwards(this.goatForm.id().value());
      this.goatForm.awards().value.set(awards || []);
    } catch (error) {
      await this.adgaService.handleError(error as Error, 'Error Syncing Awards!');
    } finally {
      this.syncingAwards = false;
    }
  }

  currentLactation = computed(() => (this.goatForm.lactationRecords().value()).find(record => record.isCurrent));
}
