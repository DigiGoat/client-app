import { ipcRenderer } from 'electron';
import type { StdioService as StdioServiceType } from '../../../../../../shared/services/stdio/stdio.service';

// filepath: /Users/Kolton/DigiGoat/client-app/projects/preload/src/app/app/services/stdio/stdio.service.ts

export const StdioService: StdioServiceType = {
  onstdout: (callback) => ipcRenderer.on('stdio:stdout', (_event, data) => callback(data)),
  onstderr: (callback) => ipcRenderer.on('stdio:stderr', (_event, data) => callback(data)),
};
