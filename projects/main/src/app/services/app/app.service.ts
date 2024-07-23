import { app, shell } from 'electron';
import { parse } from 'semver';
import { AppService as AppServiceType } from '../../../../../shared/services/app/app.service';
import type { BackendService } from '../../../../../shared/shared.module';

export class AppService {
  api: BackendService<AppServiceType> = {
    getVersion: async () => parse(app.getVersion()),
    openVersion: async (_event, version) => shell.openExternal(`https://github.com/DigiGoat/client-app/releases?q=${version}.x`),
    openLatest: async () => shell.openExternal('https://github.com/DigiGoat/client-app/releases/latest')
  };
}
