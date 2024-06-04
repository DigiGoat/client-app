import type { SharedModule } from '../../../shared/shared.module';

declare global {
  interface Window {
    electron: SharedModule;
  }
}
