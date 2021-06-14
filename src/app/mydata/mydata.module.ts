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
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';

import { HomeComponent } from './components/home/home.component';
import { WelcomeStepperComponent } from './components/welcome-stepper/welcome-stepper.component';
import { ProfileDataHandlerComponent } from './components/profile-data-handler/profile-data-handler.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { RedirectComponent } from './components/redirect/redirect.component';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LoginComponent } from './components/login/login.component';

import { AuthGuard } from './services/auth-guard.service';

import { SharedModule } from '../shared/shared.module';
import { OrcidIdInfoComponent } from './components/welcome-stepper/orcid-id-info/orcid-id-info.component';
import { StepperNavigationComponent } from './components/welcome-stepper/stepper-navigation/stepper-navigation.component';

import { ModalModule } from 'ngx-bootstrap/modal';
import { ProfilePanelComponent } from './components/profile-data-handler/profile-panel/profile-panel.component';
import { FilterPipe } from './pipes/filter.pipe';
import { GetLocalizedValuesPipe } from './pipes/getLocalizedValues.pipe';
import { EditorModalComponent } from './components/profile-data-handler/editor-modal/editor-modal.component';
import { ProfileComponent } from './components/profile/profile.component';
import { PanelArrayItemComponent } from './components/profile-data-handler/profile-panel/panel-array-item/panel-array-item.component';
import { CheckFieldLocalePipe } from './pipes/check-field-locale.pipe';
import { ParseDatePipe } from './pipes/parse-date.pipe';
import { ActivityItemComponent } from './components/profile-data-handler/profile-panel/activity-item/activity-item.component';
import { GetPrimaryOptionsPipe } from './pipes/get-primary-options.pipe';
import { PrimaryBadgeComponent } from './components/profile-data-handler/profile-panel/primary-badge/primary-badge.component';
import { SearchPublicationsComponent } from './components/profile-data-handler/profile-panel/search-publications/search-publications.component';
import { PublicationsListComponent } from './components/profile-data-handler/profile-panel/publications-list/publications-list.component';

@NgModule({
  declarations: [
    HomeComponent,
    WelcomeStepperComponent,
    ProfileDataHandlerComponent,
    NotFoundComponent,
    RedirectComponent,
    LoginComponent,
    OrcidIdInfoComponent,
    StepperNavigationComponent,
    ProfilePanelComponent,
    FilterPipe,
    GetLocalizedValuesPipe,
    EditorModalComponent,
    ProfileComponent,
    PanelArrayItemComponent,
    CheckFieldLocalePipe,
    ParseDatePipe,
    ActivityItemComponent,
    GetPrimaryOptionsPipe,
    PrimaryBadgeComponent,
    SearchPublicationsComponent,
    PublicationsListComponent,
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
    MatTabsModule,
    MatSnackBarModule,
    MatDialogModule,
    MatDividerModule,
    MatTableModule,
    FontAwesomeModule,
    SharedModule,
    ModalModule,
  ],
  providers: [AuthGuard],
})
export class MyDataModule {}
