import { BrowserWindow } from 'electron';
import type { PreviewService as PreviewServiceType } from '../../../../../shared/services/preview/preview.service';
import type { BackendService } from '../../../../../shared/shared.module';
import { PreviewWindow } from '../../windows/preview/preview.window';

export class PreviewService {
  api: BackendService<PreviewServiceType> = {
    getPreviewActive: async () => {
      const windows = BrowserWindow.getAllWindows();
      const previewWindow = windows.find(window => window.getBackgroundColor() === '#FFFFFF');
      return !!previewWindow;
    },
    getPreviewVisible: async () => {
      const windows = BrowserWindow.getAllWindows();
      const previewWindow = windows.find(window => window.getBackgroundColor() === '#FFFFFF');
      return previewWindow?.isVisible() ?? false;
    },
    getPreviewCloseable: async () => {
      const windows = BrowserWindow.getAllWindows();
      const previewWindow = windows.find(window => window.getBackgroundColor() === '#FFFFFF');
      return previewWindow?.closable ?? false;
    },
    startPreview: async () => {
      const windows = BrowserWindow.getAllWindows();
      const previewWindow = windows.find(window => window.getBackgroundColor() === '#FFFFFF');
      if (previewWindow) {
        if (previewWindow.isVisible()) {
          if (previewWindow.isMinimized()) {
            previewWindow.restore();
          }
          previewWindow.focus();
        }
        return;
      }
      new PreviewWindow();
    },
    stopPreview: async () => {
      const windows = BrowserWindow.getAllWindows();
      const previewWindow = windows.find(window => window.getBackgroundColor() === '#FFFFFF');
      previewWindow?.close();
    }
  };
}
