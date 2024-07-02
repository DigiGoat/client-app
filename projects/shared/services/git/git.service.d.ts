import type { SimpleGitProgressEvent, StatusResult, VersionResult } from 'simple-git';

export interface GitService {
  isRepo: () => Promise<boolean>;
  setup: (repo: string, name: string, email: string, token?: string) => Promise<void>;
  updateSetup: (repo: string, name: string, email: string, token?: string) => Promise<void>;
  onprogress: (callback: (event: SimpleGitProgressEvent) => void) => void;
  version: () => Promise<VersionResult>;
  install: () => Promise<void>;
  getPublishedDoes: () => Promise<Goat[]>;
  commitDoes: (message: string[]) => Promise<void>;
  commitBucks: (message: string[]) => Promise<void>;
  commitConfig: (message: string[]) => Promise<void>;
  push: () => Promise<void>;
  reset: () => Promise<void>;
  getStatus: () => Promise<StatusResult>;
  onchange: (callback: () => void) => void;
}
