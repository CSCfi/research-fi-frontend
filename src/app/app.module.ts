//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

// import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutModule } from './layout/layout.module';
// import { AppConfigService } from './shared/services/app-config-service.service';
// import { CommonComponentsModule } from './shared/shared.module';
// import { PortalModule } from './portal/portal.module';
// import { InterceptService } from './shared/services/intercept.service';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    // BrowserModule.withServerTransition({ appId: 'serverApp' }),
    HttpClientModule,
    // AppRoutingModule,
    BrowserAnimationsModule,
    LayoutModule,
    // CommonComponentsModule,
    // PortalModule,
  ],
  providers: [
    // AppConfigService,
    // {
    //   provide: APP_INITIALIZER,
    //   multi: true,
    //   deps: [AppConfigService],
    //   useFactory: (appConfigService: AppConfigService) => {
    //     // Load configuration from file when application starts.
    //     return () => {
    //       return appConfigService.loadAppConfig();
    //     };
    //   },
    // },
    // {
    //   provide: HTTP_INTERCEPTORS,
    //   useClass: InterceptService,
    //   multi: true,
    // }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }