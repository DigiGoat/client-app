import type { SimpleGitProgressEvent, StatusResult, VersionResult } from 'simple-git';
import type { Goat } from '../goat/goat.service';
import type { SemVer } from 'semver';

export interface GitService {
  isRepo: () => Promise<boolean>;
  setup: (repo: string, name: string, email: string, token?: string) => Promise<void>;
  updateSetup: (repo: string, name: string, email: string, token?: string) => Promise<void>;
  setupDemo: () => Promise<void>;
  setupBlank: () => Promise<void>;
  onprogress: (callback: (event: SimpleGitProgressEvent) => void) => void;
  version: () => Promise<VersionResult>;
  install: () => Promise<void>;
  trust: () => Promise<void>;
  getPublishedDoes: () => Promise<Goat[]>;
  commitDoes: (message: string[]) => Promise<void>;
  commitBucks: (message: string[]) => Promise<void>;
  commitConfig: (message: string[]) => Promise<void>;
  commitRelated: (message: string[]) => Promise<void>;
  commitKiddingSchedule: (message: string[]) => Promise<void>;
  push: () => Promise<void>;
  reset: () => Promise<void>;
  getStatus: () => Promise<StatusResult>;
  onchange: (callback: () => void) => void;
  fetchUpdate: () => Promise<SemVer>;
  readUpdate: () => Promise<SemVer>;
  installUpdates: () => Promise<SemVer>;
  commitImages: (paths: string[], message: string[]) => Promise<void>;
  commitFavicon: () => Promise<void>;
  getSetup: () => Promise<{ repo?: string, name?: string, email?: string, token?: string; }>;
}
