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

import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import {
  MatSnackBarModule,
  MatSnackBarConfig,
  MAT_SNACK_BAR_DEFAULT_OPTIONS,
} from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';

import { HomeComponent } from './components/home/home.component';
import { WelcomeStepperComponent } from './components/welcome-stepper/welcome-stepper.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { RedirectComponent } from './components/redirect/redirect.component';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LoginComponent } from './components/login/login.component';

import { AuthGuard } from './services/auth-guard.service';

import { SharedModule } from '../shared/shared.module';
import { OrcidIdInfoComponent } from './components/welcome-stepper/orcid-id-info/orcid-id-info.component';
import { StepperNavigationComponent } from './components/welcome-stepper/stepper-navigation/stepper-navigation.component';

import { ProfilePanelComponent } from './components/profile/profile-panel/profile-panel.component';
import { FilterPipe } from './pipes/filter.pipe';
import { GetLocalizedValuesPipe } from './pipes/getLocalizedValues.pipe';
import { EditorModalComponent } from './components/profile/editor-modal/editor-modal.component';
import { ProfileComponent } from './components/profile/profile.component';
import { PanelArrayItemComponent } from './components/profile/profile-panel/panel-array-item/panel-array-item.component';
import { CheckFieldLocalePipe } from './pipes/check-field-locale.pipe';
import { ParseDatePipe } from './pipes/parse-date.pipe';
import { ActivityItemComponent } from './components/profile/profile-panel/activity-item/activity-item.component';
import { GetPrimaryOptionsPipe } from './pipes/get-primary-options.pipe';
import { PrimaryBadgeComponent } from './components/profile/profile-panel/primary-badge/primary-badge.component';
import { SearchPublicationsComponent } from './components/profile/profile-panel/search-publications/search-publications.component';
import { PublicationsListComponent } from './components/profile/profile-panel/publications-list/publications-list.component';
import { CustomPaginatorIntlComponent } from './components/profile/profile-panel/custom-paginator-intl/custom-paginator-intl.component';
import { CountGroupItemsPipe } from './pipes/count-group-items.pipe';
import { MydataBetaInfoComponent } from './components/mydata-beta-info/mydata-beta-info.component';
import { ProfileSummaryComponent } from './components/profile/profile-summary/profile-summary.component';
import { JoinItemsPipe } from './pipes/join-items.pipe';
import { FindSelectedItemPipe } from './pipes/find-selected-item.pipe';
import { HandleFetchedPublicationsPipe } from './pipes/handle-fetched-publications.pipe';
import { SortPublicationsPipe } from './pipes/sort-publications.pipe';
import { EulaComponent } from './components/eula/eula.component';
import { DraftSummaryComponent } from './components/profile/draft-summary/draft-summary.component';
import { ContactCardComponent } from './components/profile/cards/contact-card/contact-card.component';
import { CollaborationCardComponent } from './components/profile/cards/collaboration-card/collaboration-card.component';
import { JoinAllGroupItemsPipe } from './pipes/join-all-group-items.pipe';
import { EmptyCardComponent } from './components/profile/cards/empty-card/empty-card.component';
import { SummaryAffiliationComponent } from './components/profile/profile-summary/summary-affiliation/summary-affiliation.component';
import { SummaryDividerComponent } from './components/profile/profile-summary/summary-divider/summary-divider.component';
import { GetItemsByPipe } from './pipes/get-items-by.pipe';

const matSnackbarDefaultConfig: MatSnackBarConfig = {
  verticalPosition: 'top',
  horizontalPosition: 'center',
  duration: 3000,
};

@NgModule({
  declarations: [
    HomeComponent,
    WelcomeStepperComponent,
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
    CountGroupItemsPipe,
    MydataBetaInfoComponent,
    ProfileSummaryComponent,
    JoinItemsPipe,
    FindSelectedItemPipe,
    HandleFetchedPublicationsPipe,
    SortPublicationsPipe,
    EulaComponent,
    DraftSummaryComponent,
    ContactCardComponent,
    CollaborationCardComponent,
    JoinAllGroupItemsPipe,
    EmptyCardComponent,
    SummaryAffiliationComponent,
    SummaryDividerComponent,
    GetItemsByPipe,
  ],
  imports: [
    CommonModule,
    FormsModule,
    MyDataRoutingModule,
    SharedModule,
    FontAwesomeModule,
    TooltipModule.forRoot(),
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
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatRippleModule,
  ],
  providers: [
    AuthGuard,
    { provide: MatPaginatorIntl, useClass: CustomPaginatorIntlComponent },
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: matSnackbarDefaultConfig,
    },
  ],
})
export class MyDataModule {}
