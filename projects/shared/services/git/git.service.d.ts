export interface GitService {
  info: () => Promise<{ installed: boolean, version: string; }>;
  isRepo: () => Promise<boolean>;
  init: () => Promise<void>;
}
