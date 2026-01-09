import { ErrorHandler, NgModule, provideAppInitializer } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { Router } from '@angular/router';
import { createErrorHandler, TraceService } from '@sentry/angular';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [
    {
      provide: ErrorHandler,
      useValue: createErrorHandler(),
    },
    {
      provide: TraceService,
      deps: [Router],
    },
    {
      provide: provideAppInitializer,
      useFactory: () => () => {},
      deps: [TraceService],
      multi: true,
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
