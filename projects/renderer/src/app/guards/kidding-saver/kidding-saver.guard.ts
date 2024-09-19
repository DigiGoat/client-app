import { inject } from '@angular/core';
import { type CanDeactivateFn } from '@angular/router';
import { DialogService } from '../../services/dialog/dialog.service';
import { KiddingScheduleComponent } from '../../windows/main/kidding-schedule/kidding-schedule.component';

export const kiddingSaverGuard: CanDeactivateFn<KiddingScheduleComponent> = async (component) => {
  const dialogService = inject(DialogService);
  if (component.getChanges()) {
    const action = await dialogService.showMessageBox({ message: 'Unsaved Changes!', detail: 'Would you like to continue anyway?', buttons: ['Save Changes', 'Continue Without Saving', 'Cancel'], defaultId: 0 });
    switch (action.response) {
      case 0:
        await component.saveChanges();
        return true;
      case 1:
        return true;
      default:
        return false;
    }
  } else {
    return true;
  }
};
