import { inject } from '@angular/core';
import type { CanDeactivateFn } from '@angular/router';
import { DialogService } from '../../services/dialog/dialog.service';
import { WindowService } from '../../services/window/window.service';
import type { SaveableStrategy } from '../../strategies/saveable/saveable.strategy';

export const SaveGuard: CanDeactivateFn<SaveableStrategy> = async (component) => {
  if (component.unsavedChanges()) {
    const dialogService = inject(DialogService);
    const windowService = inject(WindowService);
    const action = await dialogService.showMessageBox({ message: 'Unsaved Changes!', detail: 'Would you like to continue anyway?', buttons: ['Save Changes', 'Continue Without Saving', 'Cancel'], defaultId: 0 });
    switch (action.response) {
      case 0:
        await component.saveChanges();
        return true;
      case 1:
        await windowService.setUnsavedChanges(false);
        return true;
      default:
        return false;
    }
  } else {
    return true;
  }
};
