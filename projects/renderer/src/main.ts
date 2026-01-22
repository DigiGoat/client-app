import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { init as angularInit } from '@sentry/angular';
import { browserProfilingIntegration, browserTracingIntegration, feedbackIntegration, httpClientIntegration, init, replayIntegration, reportingObserverIntegration } from '@sentry/electron/renderer';
import { AppModule } from './app/app.module';
init({
  // Adds request headers and IP for users, for more info visit:
  // https://docs.sentry.io/platforms/javascript/guides/angular/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
  integrations: [
    // Registers and configures the Tracing integration,
    // which automatically instruments your application to monitor its
    // performance, including custom Angular routing instrumentation
    browserTracingIntegration(),
    browserProfilingIntegration(),

    // Registers the Replay integration,
    // which automatically captures Session Replays
    replayIntegration(
      {
        maskAllText: false,
        blockAllMedia: false,
        maskAllInputs: false,
      }
    ),
    httpClientIntegration(),
    reportingObserverIntegration(),
    feedbackIntegration({
      // Additional SDK configuration goes in here, for example:
      colorScheme: 'system',
    })
  ],
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for tracing.
  // We recommend adjusting this value in production
  // Learn more at
  // https://docs.sentry.io/platforms/javascript/configuration/options/#traces-sample-rate
  tracesSampleRate: 1.0,
  // Set `tracePropagationTargets` to control for which URLs trace propagation should be enabled
  //tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
  // Capture Replay for 10% of all sessions,
  // plus for 100% of sessions with an error
  // Learn more at
  // https://docs.sentry.io/platforms/javascript/session-replay/configuration/#general-integration-configuration
  replaysSessionSampleRate: 1,//0.1,
  replaysOnErrorSampleRate: 1.0,
  profileSessionSampleRate: 1.0,
  profileLifecycle: 'trace',
}, angularInit);

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
