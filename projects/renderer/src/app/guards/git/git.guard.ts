import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { DialogService } from '../../services/dialog/dialog.service';
import { GitService } from '../../services/git/git.service';
import { WindowService } from '../../services/window/window.service';

export const GitGuard: CanActivateFn = async () => {
  const gitService = inject(GitService);
  const windowService = inject(WindowService);
  const dialogService = inject(DialogService);
  const version = await gitService.version();
  if (version.installed) {
    return true;
  } else {
    console.warn('Git Not Found!');
    await dialogService.showMessageBox({ message: 'Git Not Found!', type: 'warning', detail: 'Please Click Below To Setup Git' });
    await windowService.openGit();
    await windowService.close();
    return false;
  }
};
