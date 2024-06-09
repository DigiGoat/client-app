export interface GitService {
  isRepo: () => Promise<boolean>;
  setup: (repo: string, token?: string) => Promise<void>;
}
