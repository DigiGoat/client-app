import { GoatType } from '../goat/goat.service';
export interface WindowService {
  close: (ignoreChanges?: true) => Promise<void>;
  openSetup: () => Promise<void>;
  openMain: () => Promise<void>;
  openGit: () => Promise<void>;
  quit: () => Promise<void>;
  setUnsavedChanges: (unsavedChanges: boolean) => Promise<void>;
  onsave: (callback: () => void) => void;
  openGoat: (type: GoatType, index: number) => Promise<void>;
  setTitle: (title: string) => Promise<void>;
}
