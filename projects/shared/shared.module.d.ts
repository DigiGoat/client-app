import type { IpcMainEvent } from 'electron';
import type { DialogService } from './services/dialog/dialog.service';
import type { GitService } from './services/git/git.service';
import type { WindowService } from './services/window/window.service';

export interface SharedModule {
  git: GitService;
  window: WindowService;
  dialog: DialogService;
}

export type BackendService<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => any ? (event: IpcMainEvent, ...args: A) => ReturnType<T[K]> : never;
}; export type BackendSharedModule = Record<keyof SharedModule, BackendService<SharedModule[keyof SharedModule]>>;
