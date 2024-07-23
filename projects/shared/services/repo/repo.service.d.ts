import type { SemVer } from 'semver';

export interface RepoService {
  getVersion: () => Promise<SemVer | undefined>;
}
