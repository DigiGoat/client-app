import { Component, computed, effect, inject, signal, type OnInit } from '@angular/core';
import { debounce, form, readonly } from '@angular/forms/signals';
import { ActivatedRoute } from '@angular/router';
import { LongDatePipe } from '../../pipes/longDate/longDate.pipe';
import { DiffService } from '../../services/diff/diff.service';
import { GoatService, KIDDING, type GOAT } from '../../services/goat/goat.service';
import { SaveableStrategy } from '../../strategies/saveable/saveable.strategy';

@Component({
  selector: 'app-kidding',
  standalone: false,
  templateUrl: './kidding.component.html',
  styleUrl: './kidding.component.scss',
})
export class KiddingComponent extends SaveableStrategy implements OnInit {
  private route = inject(ActivatedRoute);
  private goatService = inject(GoatService);
  private diffService = inject(DiffService);
  private longDatePipe = new LongDatePipe();

  index = signal(-1);
  private savedKidding = signal(KIDDING);
  private kiddingModel = signal(KIDDING);
  public kiddingForm = form(this.kiddingModel, form => {
    readonly(form, { when: () => this.loading() });
    debounce(form.exposed, 'blur');
    debounce(form.due, 'blur');
    debounce(form.kidded, 'blur');
  });
  loading = signal(true);

  public does = signal<GOAT[]>([]);
  public bucks = signal<GOAT[]>([]);
  constructor() {
    super();
    effect(() => {
      const exposed = this.kiddingForm.exposed().value();
      this.kiddingForm.exposed().value.set(this.longDatePipe.transform(exposed));
    });
    effect(() => {
      const due = this.kiddingForm.due().value();
      this.kiddingForm.due().value.set(this.longDatePipe.transform(due));
    });
    effect(() => {
      const kidded = this.kiddingForm.kidded().value();
      this.kiddingForm.kidded().value.set(this.longDatePipe.transform(kidded));
    });
  }

  public dam = computed(() => this.does().find(doe =>
    doe.normalizeId === this.kiddingForm.dam().value() || doe.name === this.kiddingForm.dam().value() || doe.nickname === this.kiddingForm.dam().value()
  ));
  public sire = computed(() => this.bucks().find(buck =>
    buck.normalizeId === this.kiddingForm.sire().value() || buck.name === this.kiddingForm.sire().value() || buck.nickname === this.kiddingForm.sire().value()
  ));

  override unsavedChanges = computed(() => Object.keys(this.dirtyFields()).length > 0);
  async ngOnInit() {
    this.index.set(Number(this.route.snapshot.params['kidding']));
    this.goatService.kiddingSchedule.subscribe({
      next: kiddingSchedule => {
        this.savedKidding.set(kiddingSchedule[this.index()] ?? KIDDING);
        if (this.loading()) {
          this.kiddingModel.set(this.savedKidding());
        }
        this.kiddingForm().reset();
        this.loading.set(false);
      }
    });
    this.goatService.does.subscribe({
      next: does => {
        this.does.set(does);
      }
    });
    this.goatService.bucks.subscribe({
      next: bucks => {
        this.bucks.set(bucks);
      }
    });
  }

  dirtyFields = computed(() => this.diffService.diff(this.savedKidding(), this.kiddingForm().value()) as Partial<KIDDING>);
  saveChanges = async () => {
    this.loading.set(true);
    await this.goatService.updateKidding(this.index(), this.kiddingForm().value());
    this.savedKidding.set(this.kiddingForm().value());
    this.loading.set(false);
  };

  projectedDueDate = computed(() => this.longDatePipe.transform(this.calculateDays(this.kiddingForm.exposed().controlValue(), this.dam()?.normalizeId?.startsWith('PD') ? 145 : 150)));
  projectedExposedDate = computed(() => this.longDatePipe.transform(this.calculateDays(this.kiddingForm.due().controlValue(), this.dam()?.normalizeId?.startsWith('PD') ? -145 : -150)));
  calculateGestation(firstDate?: string, secondDate?: string) {
    if (!firstDate || !Date.parse(firstDate) || !secondDate || !Date.parse(secondDate)) {
      return;
    }
    const first = new Date(firstDate);
    const second = new Date(secondDate);
    const diff = Math.abs(first.getTime() - second.getTime());
    const days = Math.round(diff / (1000 * 60 * 60 * 24));
    return `(${days} days)`;
  }
  calculateDays(date?: string, days?: number) {
    if (!date || !Date.parse(date) || !days) {
      return;
    }
    const oldDate = new Date(date);
    const newDate = new Date(oldDate.getTime() + days * 24 * 60 * 60 * 1000);
    return newDate.toString();
  }
  calculateAge(birthDate?: string, endDate?: string) {
    if (!birthDate || !Date.parse(birthDate) || !endDate || !Date.parse(endDate)) {
      return;
    }
    const years = Math.floor((new Date(endDate).getTime() - new Date(birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365));
    const months = Math.floor((new Date(endDate).getTime() - new Date(birthDate).getTime() - (years * 1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
    return `${years} year${years !== 1 ? 's' : ''} and ${months} month${months !== 1 ? 's' : ''}`;
  }
}