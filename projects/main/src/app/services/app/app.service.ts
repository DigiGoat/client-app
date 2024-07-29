import { app, shell, systemPreferences } from 'electron';
import { parse } from 'semver';
import { AppService as AppServiceType } from '../../../../../shared/services/app/app.service';
import type { BackendService } from '../../../../../shared/shared.module';
import { readdir } from 'fs-extra';

export class AppService {
  api: BackendService<AppServiceType> = {
    getVersion: async () => parse(app.getVersion()),
    openVersion: async (_event, version) => shell.openExternal(`https://github.com/DigiGoat/client-app/releases?q=${version}.x`),
    openLatest: async () => shell.openExternal('https://github.com/DigiGoat/client-app/releases/latest'),
    authenticate: async (_event, message) => {
      if (systemPreferences.canPromptTouchID()) {
        try {
          await systemPreferences.promptTouchID(message);
          return true;
        } catch (_err) {
          return false;
        }
      } else {
        return true;
      }
    },
    inspectDirectory: async (_event, path) => {
      return await readdir(path);
    }
  };
}
