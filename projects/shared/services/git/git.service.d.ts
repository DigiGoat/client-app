import type { SimpleGitProgressEvent, VersionResult } from 'simple-git';

export interface GitService {
  isRepo: () => Promise<boolean>;
  setup: (repo: string, name: string, email: string, token?: string) => Promise<void>;
  updateSetup: (repo: string, name: string, email: string, token?: string) => Promise<void>;
  onprogress: (callback: (event: SimpleGitProgressEvent) => void) => void;
  version: () => Promise<VersionResult>;
  install: () => Promise<void>;
  getPublishedDoes: () => Promise<Goat[]>;
}
