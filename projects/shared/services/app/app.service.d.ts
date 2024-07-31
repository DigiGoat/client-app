import type { SemVer } from 'semver';

export interface AppService {
  getVersion: () => Promise<SemVer>;
  openVersion: (version: number) => Promise<void>;
  openLatest: () => Promise<void>;
  authenticate: (message: string) => Promise<boolean>;
  inspectDirectory: (path: string) => Promise<string[]>;
  platform: NodeJS.Platform;
}
