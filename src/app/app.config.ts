import { APP_ID, APP_INITIALIZER, ApplicationConfig, ErrorHandler, importProvidersFrom } from '@angular/core';

import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import {
  InMemoryScrollingFeature,
  InMemoryScrollingOptions,
  provideRouter,
  withInMemoryScrolling
} from '@angular/router';
import { routes } from './routes';
import { AuthConfigModule } from './auth-config.module';
import { AppConfigService } from '@shared/services/app-config-service.service';
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { InterceptService } from '@shared/services/intercept.service';
import { ErrorHandlerService } from '@shared/services/error-handler.service';
import { WINDOW_PROVIDERS } from '@shared/services/window.service';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatPaginatorIntl } from '@angular/material/paginator';
import {
  CustomPaginatorIntlComponent
} from '@mydata/components/profile/search-portal/custom-paginator-intl/custom-paginator-intl.component';
import { DateAdapter, MAT_DATE_FORMATS, MAT_NATIVE_DATE_FORMATS, NativeDateAdapter } from '@angular/material/core';
import { provideAnimations } from '@angular/platform-browser/animations';

const matSnackbarDefaultConfig: MatSnackBarConfig = {
  verticalPosition: 'top',
  horizontalPosition: 'center',
  duration: 3000
};

// scrollPositionRestoration should be set to 'top' in CSCTV-4122 implementation
const scrollConfig: InMemoryScrollingOptions = {
  scrollPositionRestoration: 'disabled',
  anchorScrolling: 'enabled',
};

const inMemoryScrollingFeature: InMemoryScrollingFeature =
  withInMemoryScrolling(scrollConfig);

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(
      BrowserModule,
      AuthConfigModule,
    ),
    provideAnimations(),

    /*AppConfigService,
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [AppConfigService],
      useFactory: (appConfigService: AppConfigService) => {
        // Load configuration from file when application starts.
        return () => {
          console.log("OLD WAY OF APP_INITIALIZER IS SET");
          return appConfigService.loadAppConfig();
        };
      }
    },*/
    {
      provide: HTTP_INTERCEPTORS,
      useClass: InterceptService,
      multi: true
    },
    {
      provide: ErrorHandler,
      useClass: ErrorHandlerService
    },

    WINDOW_PROVIDERS,

    {
      provide: LocationStrategy,
      useClass: PathLocationStrategy
    },
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: { duration: 3000 }
    },

    { provide: MatPaginatorIntl, useClass: CustomPaginatorIntlComponent },
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: matSnackbarDefaultConfig
    },

    { provide: DateAdapter, useClass: NativeDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS },

    { provide: APP_ID,  useValue: 'serverApp' },

    provideClientHydration(),
    provideRouter(routes, inMemoryScrollingFeature),
    provideHttpClient(withFetch(), withInterceptorsFromDi()),
    provideAnimations(),
  ]
};
