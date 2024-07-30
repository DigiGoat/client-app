import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { DialogService } from '../../services/dialog/dialog.service';
import { GitService } from '../../services/git/git.service';
import { WindowService } from '../../services/window/window.service';

export const RepoGuard: CanActivateFn = async () => {
  const gitService = inject(GitService);
  const windowService = inject(WindowService);
  const dialogService = inject(DialogService);
  try {
    if (await gitService.isRepo()) {
      return true;
    } else {
      console.warn('Repository Not Found!');
      await dialogService.showMessageBox({ message: 'Website Not Found!', type: 'warning', detail: 'Please Click Below To Setup Your Website' });
      await windowService.openSetup();
      await windowService.close();
      return false;
    }
  } catch (e) {
    //Git Isn't Installed, Another Guard Will Handle This
    return false;
  }
};
