//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER, ErrorHandler } from '@angular/core';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutModule } from './layout/layout.module';
import { AppConfigService } from './shared/services/app-config-service.service';
import { SharedModule } from './shared/shared.module';
import { InterceptService } from './shared/services/intercept.service';
import { PortalModule } from './portal/portal.module';
import { PortalRoutingModule } from './portal/portal-routing.module';
import { MyDataModule } from './mydata/mydata.module';
import { MyDataRoutingModule } from './mydata/mydata-routing.module';
import { AuthConfigModule } from './auth-config.module';
import { ErrorHandlerService } from './shared/services/error-handler.service';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    HttpClientModule,
    BrowserAnimationsModule,
    LayoutModule,
    SharedModule,
    PortalModule,
    PortalRoutingModule,
    MyDataModule,
    MyDataRoutingModule,
    AuthConfigModule,
  ],
  providers: [
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
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
