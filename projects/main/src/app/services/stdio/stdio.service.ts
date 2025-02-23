import { BrowserWindow } from 'electron';
import type { StdioService as StdioServiceType } from '../../../../../shared/services/stdio/stdio.service';
import type { BackendService } from '../../../../../shared/shared.module';

export class StdioService {
  api: BackendService<StdioServiceType> = {
  };

  constructor() {
    const originalStdoutWrite = process.stdout.write.bind(process.stdout);
    const originalStderrWrite = process.stderr.write.bind(process.stderr);

    process.stdout.write = (chunk, ...args) => {
      BrowserWindow.getAllWindows().forEach(window => window.webContents.send('stdio:stdout', chunk.toString()));
      return originalStdoutWrite(chunk, ...args);
    };

    process.stderr.write = (chunk, ...args) => {
      BrowserWindow.getAllWindows().forEach(window => window.webContents.send('stdio:stderr', chunk.toString()));
      return originalStderrWrite(chunk, ...args);
    };
  }
}
