import { effect, inject, type Signal } from '@angular/core';
import { DialogService } from '../../services/dialog/dialog.service';
import { WindowService } from '../../services/window/window.service';

export abstract class SaveableStrategy {
  abstract unsavedChanges: Signal<boolean>;
  abstract saveChanges: () => Promise<void>;
  constructor() {
    const windowService = inject(WindowService);
    effect(() => {
      const unsavedChanges = this.unsavedChanges();
      windowService.setUnsavedChanges(unsavedChanges);
    });
    const dialogService = inject(DialogService);
    windowService.onsave = async () => {
      if (this.unsavedChanges()) {
        const action = (await dialogService.showMessageBox({ message: 'Unsaved Changes!', detail: 'Would you like to continue anyway?', buttons: ['Save Changes', 'Close Without Saving', 'Cancel'], defaultId: 0 })).response;
        switch (action) {
          case 0:
            await this.saveChanges();
            await windowService.close(true);
            break;
          case 1:
            await windowService.close(true);
            break;
        }
      } else {
        await windowService.close(true);
      }
    };
  }
}
