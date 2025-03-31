import { ipcRenderer } from 'electron';
import { PreviewService as PreviewServiceType } from '../../../../../../shared/services/preview/preview.service';

export const PreviewService: PreviewServiceType = {
  getPreviewActive: () => ipcRenderer.invoke('preview:getPreviewActive'),
  getPreviewVisible: () => ipcRenderer.invoke('preview:getPreviewVisible'),
  getPreviewCloseable: () => ipcRenderer.invoke('preview:getPreviewCloseable'),
  startPreview: () => ipcRenderer.invoke('preview:startPreview'),
  stopPreview: () => ipcRenderer.invoke('preview:stopPreview'),
  onchange: (callback) => ipcRenderer.on('preview:change', () => callback()),
  onprogress: (callback) => ipcRenderer.on('preview:progress', (_, progress) => callback(progress)),
};
