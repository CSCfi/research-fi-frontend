import { enableProdMode, APP_INITIALIZER, ErrorHandler, importProvidersFrom } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';


import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AuthConfigModule } from './app/auth-config.module';
import { MyDataModule } from './app/mydata/mydata.module';
import { PortalModule } from './app/portal/portal.module';
import { SharedModule } from './app/shared/shared.module';
// import { LayoutModule } from './app/layout/layout.module';
import { provideAnimations } from '@angular/platform-browser/animations';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { ErrorHandlerService } from './app/shared/services/error-handler.service';
import { InterceptService } from './app/shared/services/intercept.service';
import { HTTP_INTERCEPTORS, withInterceptorsFromDi, provideHttpClient } from '@angular/common/http';
import { AppConfigService } from './app/shared/services/app-config-service.service';
import { provideRouter } from '@angular/router';
import { routes } from './app/routes';

if (environment.production) {
  enableProdMode();
}

document.addEventListener('DOMContentLoaded', () => {
  bootstrapApplication(AppComponent, {
    providers: [
      importProvidersFrom(
        BrowserModule,
        BrowserModule.withServerTransition({ appId: 'serverApp' }),

        // LayoutModule,
        SharedModule,
        PortalModule,
        MyDataModule,

        AuthConfigModule,
        FontAwesomeModule
      ),

      AppConfigService,
        {
            provide: APP_INITIALIZER,
            multi: true,
            deps: [AppConfigService],
            useFactory: (appConfigService: AppConfigService) => {
                // Load configuration from file when application starts.
                return () => {
                    return appConfigService.loadAppConfig();
                };
            },
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: InterceptService,
            multi: true,
        },
        {
            provide: ErrorHandler,
            useClass: ErrorHandlerService,
        },

        provideRouter(routes),
        provideHttpClient(withInterceptorsFromDi()),
        provideAnimations(),
    ]
})
    .catch((err) => console.error(err));
});
