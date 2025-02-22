import type { IpcMainEvent } from 'electron';
import type { ADGAService } from './services/adga/adga.service';
import type { AppService } from './services/app/app.service';
import type { ConfigService } from './services/config/config.service';
import type { DialogService } from './services/dialog/dialog.service';
import type { GitService } from './services/git/git.service';
import type { GoatService } from './services/goat/goat.service';
import type { ImageService } from './services/image/image.service';
import type { PreviewService } from './services/preview/preview.service';
import type { RepoService } from './services/repo/repo.service';
import type { WindowService } from './services/window/window.service';

export interface SharedModule {
  git: GitService;
  window: WindowService;
  dialog: DialogService;
  config: ConfigService;
  goat: GoatService;
  adga: ADGAService;
  repo: RepoService;
  app: AppService;
  image: ImageService;
  preview: PreviewService;
}

type WithoutOnKeys<T> = {
  [K in keyof T as K extends `on${infer _}` ? never : K]: T[K] extends (...args: infer A) => any ? (event: IpcMainEvent, ...args: A) => ReturnType<T[K]> : never;
};

type WithoutNonPromises<T> = {
  [K in keyof T as T[K] extends (...args: any[]) => Promise<any> ? K : never]: T[K]
};

export type BackendService<T> = {
  [K in keyof WithoutOnKeys<WithoutNonPromises<T>>]: T[K] extends (...args: infer A) => any ? (event: IpcMainEvent, ...args: A) => ReturnType<T[K]> : never;
};
export type BackendSharedModule = Record<keyof SharedModule, BackendService<SharedModule[keyof SharedModule]>>;
