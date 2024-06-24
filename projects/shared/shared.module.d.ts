import type { IpcMainEvent } from 'electron';
import type { ADGAService } from './services/adga/adga.service';
import type { ConfigService } from './services/config/config.service';
import type { DialogService } from './services/dialog/dialog.service';
import type { GitService } from './services/git/git.service';
import type { GoatService } from './services/goat/goat.service';
import type { WindowService } from './services/window/window.service';

export interface SharedModule {
  git: GitService;
  window: WindowService;
  dialog: DialogService;
  config: ConfigService;
  goat: GoatService;
  adga: ADGAService;
}

type WithoutOnKeys<T> = {
  [K in keyof T as K extends `on${infer _}` ? never : K]: T[K]
};

export type BackendService<T> = {
  [K in keyof WithoutOnKeys<T>]: T[K] extends (...args: infer A) => any ? (event: IpcMainEvent, ...args: A) => ReturnType<T[K]> : never;
};
export type BackendSharedModule = Record<keyof SharedModule, BackendService<SharedModule[keyof SharedModule]>>;
