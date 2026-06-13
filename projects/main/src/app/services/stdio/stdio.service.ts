import { BrowserWindow } from 'electron';
import type { StdioService as StdioServiceType } from '../../../../../shared/services/stdio/stdio.service';
import type { BackendService } from '../../../../../shared/shared.module';

export class StdioService {
  api: BackendService<StdioServiceType> = {
  };

  constructor() {
    const originalStdoutWrite = process.stdout.write.bind(process.stdout);
    const originalStderrWrite = process.stderr.write.bind(process.stderr);

    process.stdout.write = (chunk, encoding?: BufferEncoding | ((err?: Error) => void), cb?: (err?: Error) => void) => {
      const callback = typeof encoding === 'function' ? encoding : cb;
      const enc = typeof encoding === 'string' ? encoding : undefined;
      BrowserWindow.getAllWindows().forEach(window => window.webContents.send('stdio:stdout', chunk.toString()));
      return originalStdoutWrite(chunk, enc, callback);
    };

    process.stderr.write = (chunk, encoding?: BufferEncoding | ((err?: Error) => void), cb?: (err?: Error) => void) => {
      const callback = typeof encoding === 'function' ? encoding : cb;
      const enc = typeof encoding === 'string' ? encoding : undefined;
      BrowserWindow.getAllWindows().forEach(window => window.webContents.send('stdio:stderr', chunk.toString()));
      return originalStderrWrite(chunk, enc, callback);
    };
  }
}
