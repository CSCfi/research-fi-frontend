//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { OAuthModule } from 'angular-oauth2-oidc';

import { MyDataRoutingModule } from './mydata-routing.module';

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

import { AuthGuard } from './services/auth-guard.service';

import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    HomeComponent,
    WelcomeStepperComponent,
    OrcidDataHandlerComponent,
    NotFoundComponent,
    LoginComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    OAuthModule.forRoot({
      resourceServer: {
        allowedUrls: [],
        sendAccessToken: true,
      },
    }),
    MyDataRoutingModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatRadioModule,
    MatExpansionModule,
    FontAwesomeModule,
    SharedModule,
  ],
  providers: [AuthGuard],
})
export class MyDataModule {}
