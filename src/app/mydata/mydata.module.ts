//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MyDataRoutingModule } from './mydata-routing.module';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { HomeComponent } from './components/home/home.component';
import { WelcomeStepperComponent } from './components/welcome-stepper/welcome-stepper.component';
import { OrcidDataHandlerComponent } from './components/welcome-stepper/orcid-data-handler/orcid-data-handler.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { RedirectComponent } from './components/redirect/redirect.component';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LoginComponent } from './components/login/login.component';

import { AuthGuard } from './services/auth-guard.service';

import { SharedModule } from '../shared/shared.module';
import { OrcidIdInfoComponent } from './components/welcome-stepper/orcid-id-info/orcid-id-info.component';
import { StepperNavigationComponent } from './components/welcome-stepper/stepper-navigation/stepper-navigation.component';

import { ModalModule } from 'ngx-bootstrap/modal';
import { ProfilePanelComponent } from './components/welcome-stepper/orcid-data-handler/profile-panel/profile-panel.component';
import { FilterPipe } from './pipes/filter.pipe';

@NgModule({
  declarations: [
    HomeComponent,
    WelcomeStepperComponent,
    OrcidDataHandlerComponent,
    NotFoundComponent,
    RedirectComponent,
    LoginComponent,
    OrcidIdInfoComponent,
    StepperNavigationComponent,
    ProfilePanelComponent,
    FilterPipe,
  ],
  imports: [
    CommonModule,
    FormsModule,
    MyDataRoutingModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatRadioModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonToggleModule,
    MatSlideToggleModule,
    FontAwesomeModule,
    SharedModule,
    ModalModule,
  ],
  providers: [AuthGuard],
})
export class MyDataModule {}
