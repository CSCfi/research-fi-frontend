//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { HttpClientModule } from '@angular/common/http';
import { OAuthModule } from 'angular-oauth2-oidc';

import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';

import { UiLibraryModule } from 'ui-library';
import { LayoutModule } from './layout/layout.module';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatExpansionModule } from '@angular/material/expansion';

import { HomeComponent } from './components/home/home.component';
import { WelcomeStepperComponent } from './components/welcome-stepper/welcome-stepper.component';
import { OrcidDataHandlerComponent } from './components/welcome-stepper/orcid-data-handler/orcid-data-handler.component';
import { NotFoundComponent } from './components/not-found/not-found.component';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LoginComponent } from './components/login/login.component';

import { AppConfigService } from './services/app-config-service.service';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    WelcomeStepperComponent,
    OrcidDataHandlerComponent,
    NotFoundComponent,
    LoginComponent,
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverMyData' }),
    FormsModule,
    HttpClientModule,
    OAuthModule.forRoot({
      resourceServer: {
        allowedUrls: [],
        sendAccessToken: true,
      },
    }),
    AppRoutingModule,
    BrowserAnimationsModule,
    UiLibraryModule,
    LayoutModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatRadioModule,
    MatExpansionModule,
    FontAwesomeModule,
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
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
