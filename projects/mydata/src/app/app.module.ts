//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';

import { UiLibraryModule } from 'ui-library';
import { LayoutModule } from './layout/layout.module';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';

import { HomeComponent } from './components/home/home.component';
import { IntroductionComponent } from './components/introduction/introduction.component';
import { WelcomeStepperComponent } from './components/welcome-stepper/welcome-stepper.component';
import { OrcidDataHandlerComponent } from './components/welcome-stepper/orcid-data-handler/orcid-data-handler.component';
import { NotFoundComponent } from './components/not-found/not-found.component';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    IntroductionComponent,
    WelcomeStepperComponent,
    OrcidDataHandlerComponent,
    NotFoundComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    UiLibraryModule,
    LayoutModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatRadioModule,
    FontAwesomeModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
