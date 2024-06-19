import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { ConfigService } from '../../services/config/config.service';
import { DialogService } from '../../services/dialog/dialog.service';

export const SaveGuard: CanActivateFn = async () => {
  const configService = inject(ConfigService);
  const dialogService = inject(DialogService);
  if (configService.unsavedChanges) {
    const action = await dialogService.showMessageBox({ message: 'Unsaved Changes!', detail: 'Would you like to continue anyway?', buttons: ['Save Changes', 'Continue Without Saving', 'Cancel'], defaultId: 0 });
    switch (action.response) {
      case 0:
        await configService.saveChanges();
        return true;
      case 1:
        await configService.discardChanges();
        return true;
      default:
        return false;
    }
  } else {
    return true;
  }
};
