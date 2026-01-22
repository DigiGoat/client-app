import { init } from '@sentry/electron/renderer';
import { AppModule } from './app/app/app.module';

init({
  enableLogs: true,
});
new AppModule();
