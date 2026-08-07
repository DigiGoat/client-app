import { additionalContextIntegration, electronBreadcrumbsIntegration, httpIntegration, init, mainProcessSessionIntegration } from '@sentry/electron/main';
import { app, BrowserWindow, dialog, session } from 'electron';
import { AppModule } from './app/app.module';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// eslint-disable-next-line @typescript-eslint/no-require-imports
if (require('electron-squirrel-startup')) {
  app.quit();
}
init({
  dsn: 'https://5cb98f8e2125a9f35721b4a2e66d3e57@o4510677771681792.ingest.us.sentry.io/4510677777317888',
  integrations: [
    additionalContextIntegration({
      screen: false,
      deviceModelManufacturer: true,
    }),
    electronBreadcrumbsIntegration({
      captureWindowTitles: true,
    }),
    httpIntegration(),
    mainProcessSessionIntegration({ sendOnCreate: true }),
  ],
  environment: app.isPackaged ? (app.getVersion().includes('beta') ? 'beta' : 'production') : 'development',
  dist: process.platform === 'darwin' ? (process.arch === 'arm64' ? 'macos-arm64' : 'macos-x64') : 'windows',
  debug: !app.isPackaged,
  tracesSampleRate: 1.0,
  attachScreenshot: true,
  includeLocalVariables: app.isPackaged,
  beforeSend: event => {
    if (app.isPackaged) {
      return event;
    }
    if (app.isReady()) {
      const window = new BrowserWindow({

      });
      window.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(`<html><body><h1 style="color: red;">Sentry Error</h1><pre style="white-space: pre-wrap; word-wrap: break-word;">${JSON.stringify(event, null, 2)}</pre></body></html>`)}`);
    } else {
      dialog.showErrorBox('Sentry Error', JSON.stringify(event.exception, null, 2));
    }
    return null;
  }
});
app.whenReady().then(() => {
  session.defaultSession.setDisplayMediaRequestHandler(
    (request, callback) => {
      callback({ video: request.frame || undefined });
    }, { useSystemPicker: true }
  );
});

new AppModule();
