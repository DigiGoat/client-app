import { GoatType } from '../goat/goat.service';
export interface WindowService {
  close: (ignoreChanges?: boolean, ignoreClosable?: boolean) => Promise<void>;
  openSetup: () => Promise<void>;
  openMain: () => Promise<void>;
  openGit: () => Promise<void>;
  openLogin: () => Promise<void>;
  quit: () => Promise<void>;
  setUnsavedChanges: (unsavedChanges: boolean) => Promise<void>;
  setClosable: (closable: boolean) => Promise<void>;
  onsave: (callback: () => void) => void;
  openGoat: (type: GoatType, index: number) => Promise<void>;
  setTitle: (title: string) => Promise<void>;
  openImages: (searchQueries: string[]) => Promise<void>;
  refreshMain: () => Promise<void>;
}
