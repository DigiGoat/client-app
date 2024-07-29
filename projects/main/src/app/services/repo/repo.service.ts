import { app } from 'electron';
import { copy, exists, readJSON } from 'fs-extra';
import { join } from 'path';
import { parse } from 'semver';
import { RepoService as RepoServiceType } from '../../../../../shared/services/repo/repo.service';
import { BackendService } from '../../../../../shared/shared.module';

export class RepoService {
  base = join(app.getPath('userData'), 'repo');

  api: BackendService<RepoServiceType> = {
    getVersion: async () => {
      if (await exists(join(this.base, 'package.json'))) {
        const { version } = await readJSON(join(this.base, 'package.json'));
        return parse(version);
      }
    },
    setFavicon: async (_event, path) => {
      await copy(path, join(this.base, 'src/assets/icons'));
    }
  };
}
