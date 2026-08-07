import { type CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, computed, inject, signal, type OnInit } from '@angular/core';
import { CONFIG, ConfigService } from '../../../services/config/config.service';
import { GoatService, KIDDING } from '../../../services/goat/goat.service';
import { WindowService } from '../../../services/window/window.service';
import { SaveableStrategy } from '../../../strategies/saveable/saveable.strategy';

@Component({
  selector: 'app-kidding-schedule',
  standalone: false,
  templateUrl: './kidding-schedule.component.html',
  styleUrl: './kidding-schedule.component.scss',
})
export class KiddingScheduleComponent extends SaveableStrategy implements OnInit {
  goatService = inject(GoatService);
  configService = inject(ConfigService);
  windowService = inject(WindowService);
  private savedConfig = signal(CONFIG);
  private config = signal(CONFIG);
  kiddingSchedule = signal<KIDDING[]>([]);

  private configLoading = signal(true);
  private kiddingScheduleLoading = signal(true);
  loading = computed(() => this.configLoading() || this.kiddingScheduleLoading());

  ngOnInit(): void {
    this.configService.getConfig().then(config => {
      this.configLoading.set(true);
      this.savedConfig.set(config);
      this.config.set(config);
      this.configLoading.set(false);
    });

    this.configService.onchange = config => {
      this.configLoading.set(true);
      this.savedConfig.set(config);
      this.config.set(config);
      this.configLoading.set(false);
    };
    this.goatService.kiddingSchedule.subscribe(kiddingSchedule => {
      this.kiddingScheduleLoading.set(true);
      this.kiddingSchedule.set(kiddingSchedule);
      this.kiddingScheduleLoading.set(false);
    });
  }

  get kiddingScheduleEnabled() {
    return this.config().kiddingSchedule;
  }
  set kiddingScheduleEnabled(enabled: boolean) {
    this.config.update(oldConfig => ({ ...oldConfig, kiddingSchedule: enabled }));
  }

  unsavedChanges = computed(() => this.savedConfig().kiddingSchedule !== this.config().kiddingSchedule);
  saveChanges = async () => {
    await this.configService.saveConfig(this.savedConfig(), this.config());
  };

  openKidding(index: number) {
    this.windowService.openKidding(index);
  }
  deleteKidding(_event: MouseEvent, index: number) {
    this.goatService.deleteKidding(index);
  }
  rearrangeKidding(event: CdkDragDrop<KIDDING[]>) {
    this.goatService.rearrangeKiddingSchedule(event);
  }
  addKidding() {
    this.goatService.addKidding({});
  }
}
