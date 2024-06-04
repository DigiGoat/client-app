import type { GitService } from './services/git/git.service';

export interface SharedModule {
  git: GitService;
}
