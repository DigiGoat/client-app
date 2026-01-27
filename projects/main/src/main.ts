import { additionalContextIntegration, electronBreadcrumbsIntegration, httpIntegration, init, mainProcessSessionIntegration } from '@sentry/electron/main';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { app, session } from 'electron';
import { AppModule } from './app/app.module';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
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
    nodeProfilingIntegration(),
  ],
  environment: app.isPackaged ? (app.getVersion().includes('beta') ? 'beta' : 'production') : 'development',
  dist: process.platform === 'darwin' ? (process.arch === 'arm64' ? 'macos-arm64' : 'macos-x64') : 'windows',
  debug: !app.isPackaged,
  tracesSampleRate: 1.0,
  profileSessionSampleRate: 1.0,
  profileLifecycle: 'trace',
  attachScreenshot: true,
  enableRendererProfiling: true,
  includeLocalVariables: true,
  beforeSend: event => app.isPackaged ? event : null,
});
app.whenReady().then(() => {
  session.defaultSession.setDisplayMediaRequestHandler(
    (request, callback) => {
      callback({ video: request.frame });
    }, { useSystemPicker: true }
  );
});

new AppModule();
