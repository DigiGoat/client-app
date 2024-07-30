import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AppService } from '../../services/app/app.service';
import { DialogService } from '../../services/dialog/dialog.service';
import { GitService } from '../../services/git/git.service';
import { RepoService } from '../../services/repo/repo.service';
import { WindowService } from '../../services/window/window.service';

export const VersionGuard: CanActivateFn = async () => {
  const repoService = inject(RepoService);
  const appService = inject(AppService);
  const dialogService = inject(DialogService);
  const windowService = inject(WindowService);
  const gitService = inject(GitService);

  try {
    if (!(await gitService.version()).installed) {
      return false;
    }
  } catch (e) {
    return false;
  }

  const repoVersion = await repoService.getVersion();
  const appVersion = await appService.getVersion();

  if (repoVersion && repoVersion.major < appVersion.major) {
    const action = await dialogService.showMessageBox({ message: 'Incompatible website Version', detail: 'Your website is outdated. Please update it to use this app version', buttons: ['Update', 'Install Older App', 'Switch Website\'s', 'Quit'], type: 'warning', cancelId: 3 });
    //Alert the user, try some stuff
    if (action.response === 0) {
      //Update
      try {
        const newestVersion = await gitService.fetchUpdate();
        if (newestVersion.major > appVersion.major) {
          //Another major web-ui version has been published since this app became outdated
          await dialogService.showMessageBox({ message: 'App Update Required!', detail: 'Your app is outdated. Please update it to install the latest website version', type: 'warning' });
          await appService.openLatest();
          await windowService.quit();
        } else if (newestVersion.major < appVersion.major) {
          //I screwed up and published a new app version before publishing a new web-ui version
          await dialogService.showMessageBox({ message: 'Something Weird Happened', detail: `An impossible error happened. Please try again later. (App Version: ${appVersion.raw} - Upstream Web Version: ${newestVersion.raw})`, type: 'error' });
          await windowService.quit();
        } else {
          //The update is ready
          await gitService.installUpdates();
          return true;
        }
      } catch (err) {
        //Check to see if an update is already installed
        try {
          const newVersion = await gitService.readUpdate();
          if (newVersion.major > appVersion.major) {
            //Another major web-ui version has been published since this app became outdated
            await dialogService.showMessageBox({ message: 'App Update Required!', detail: 'Your app is outdated. Please update it to install the latest website version', type: 'warning' });
            await appService.openLatest();
            await windowService.quit();
          } else if (newVersion.major < appVersion.major) {
            await gitService.handleError('Update Failed!', err as Error);
            await windowService.quit();
          } else {
            //The update is ready
            await gitService.installUpdates();
            return true;
          }
        } catch (err2) {
          await gitService.handleError('Update Failed!', err2 as Error);
          await windowService.quit();
        }
      }
    } else if (action.response === 1) {
      //Install Older App
      appService.openVersion(repoVersion.major);
      await windowService.quit();
    } else if (action.response === 2) {
      windowService.openSetup();
      windowService.close();
    } else {
      //Quit
      await windowService.quit();
    }
    return false;
  }
  return true;
};
