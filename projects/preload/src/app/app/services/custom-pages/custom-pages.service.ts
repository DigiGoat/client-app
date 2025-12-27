import { ipcRenderer } from 'electron';
import type { CustomPagesService as CustomPagesType } from '../../../../../../shared/services/custom-pages/custom-pages.service';

export const CustomPagesService: CustomPagesType = {
  getCustomPages: () => ipcRenderer.invoke('customPages:getCustomPages'),
  setCustomPages: (pages) => ipcRenderer.invoke('customPages:setCustomPages', pages),
  onCustomPagesChange: (callback) => ipcRenderer.on('customPages:customPagesChange', (_event, pages) => callback(pages)),
};
