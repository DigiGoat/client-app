import type { SimpleGitProgressEvent, VersionResult } from 'simple-git';

export interface GitService {
  isRepo: () => Promise<boolean>;
  setup: (repo: string, token?: string) => Promise<void>;
  onprogress: (callback: (event: SimpleGitProgressEvent) => void) => void;
  version: () => Promise<VersionResult>;
  install: () => Promise<void>;
}
