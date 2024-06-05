import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { GitService } from '../../services/git/git.service'; // Replace 'your-git-service-package' with the actual package name
import { WindowService } from '../../services/window/window.service'; // Replace 'your-git-service-package' with the actual package name

export const mainGuard: CanActivateFn = async () => {
  const gitService = inject(GitService);
  const windowService = inject(WindowService);
  if (await gitService.isRepo()) {
    return true;
  } else {
    console.warn('Repository Not Found!');
    await windowService.close();
    return false;
  }
};
