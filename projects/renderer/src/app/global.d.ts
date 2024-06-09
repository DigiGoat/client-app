import * as Bootstrap from 'bootstrap';
import type { SharedModule } from '../../../shared/shared.module';

declare global {
  const bootstrap: typeof Bootstrap;
  interface Window {
    electron: SharedModule;
  }
}
