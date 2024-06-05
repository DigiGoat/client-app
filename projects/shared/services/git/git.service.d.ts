export interface GitService {
  isRepo: () => Promise<boolean>;
}
