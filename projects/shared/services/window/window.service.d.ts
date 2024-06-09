export interface WindowService {
  close: () => Promise<void>;
  openSetup: () => Promise<void>;
  openMain: () => Promise<void>;
}
