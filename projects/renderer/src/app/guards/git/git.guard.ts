import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { DialogService } from '../../services/dialog/dialog.service';
import { GitService } from '../../services/git/git.service';
import { WindowService } from '../../services/window/window.service';

export const GitGuard: CanActivateFn = async () => {
  const gitService = inject(GitService);
  const windowService = inject(WindowService);
  const dialogService = inject(DialogService);

  try {
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
  } catch (e) {
    const message = (e as Error).message;
    if (message.includes('No developer tools were found, requesting install.')) {
      await dialogService.showMessageBox({ message: 'Git Not Found!', type: 'warning', detail: 'Click OK To Quit, Then Open "Install Command Line Developer Tools" In Your Dock And Follow The Steps. Once Complete, Re-Open DigiGoat' });
      await windowService.quit();
    } else if (message.includes('ENOENT')) {
      await dialogService.showMessageBox({ message: 'Git Not Found!', type: 'warning', detail: 'Please Click Below To Setup Git' });
      await windowService.openGit();
      await windowService.close();
    } else if (message.includes('You have not agreed to the Xcode license agreements')) {
      const action = await dialogService.showMessageBox({ message: 'License Expired!', type: 'warning', detail: 'Please Click Below To Review the Xcode and Apple SDKs license. This will bring up a Terminal window. Follow the prompts displayed. Once Complete, Re-Open DigiGoat', buttons: ['Review', 'Cancel'] });
      if (action.response === 0) {
        await gitService.trust();
      }
      await windowService.quit();
    } else {
      await dialogService.showMessageBox({ message: 'Git Error!', type: 'error', detail: message });
    }
    return false;
  }
};
