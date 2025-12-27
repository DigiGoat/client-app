import { app, shell, systemPreferences } from 'electron';
import { readdir } from 'fs-extra';
import { parse } from 'semver';
import { AppService as AppServiceType } from '../../../../../shared/services/app/app.service';
import type { BackendService } from '../../../../../shared/shared.module';

export class AppService {
  api: BackendService<AppServiceType> = {
    getVersion: async () => parse(app.getVersion()),
    openVersion: async (_event, version) => shell.openExternal(`https://github.com/DigiGoat/client-app/releases?q=v${version}.x`),
    openLatest: async () => shell.openExternal('https://github.com/DigiGoat/client-app/releases/latest'),
    authenticate: async (_event, message) => {
      try {
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
      } catch (_err) {
        //Failed to check if touch ID is allowed, this just means we are on windows
        return true;
      }
    },
    openMarkdown: async () => shell.openExternal('https://docs.github.com/github/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax'),
    inspectDirectory: async (_event, path) => {
      return await readdir(path);
    },
    base64Decode: async (_event, data: string) => {
      return Buffer.from(data, 'base64url').toString('utf-8');
    }
  };
}
