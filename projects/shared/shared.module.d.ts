import type { GitService } from './services/git/git.service';
import type { WindowService } from './services/window/window.service';

export interface SharedModule {
  git: GitService;
  window: WindowService;
}
