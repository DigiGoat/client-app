import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { GitService } from '../../services/git/git.service';
import { WindowService } from '../../services/window/window.service';

export const RepoGuard: CanActivateFn = async () => {
  const gitService = inject(GitService);
  const windowService = inject(WindowService);
  if (await gitService.isRepo()) {
    return true;
  } else {
    console.warn('Repository Not Found!');
    await windowService.openSetup();
    await windowService.close();
    return false;
  }
};
