import type { SemVer } from 'semver';

export interface RepoService {
  getVersion: () => Promise<SemVer | undefined>;
  setFavicon: (path: string) => Promise<void>;
}
