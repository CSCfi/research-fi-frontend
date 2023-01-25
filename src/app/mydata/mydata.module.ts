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
import { MatMenuModule } from '@angular/material/menu';

import { HomeComponent } from './components/home/home.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { RedirectComponent } from './components/redirect/redirect.component';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LoginComponent } from './components/login/login.component';

import { AuthGuard } from './services/auth-guard.service';

import { SharedModule } from '../shared/shared.module';

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
import { SearchPortalComponent } from './components/profile/search-portal/search-portal.component';
import { SearchPortalResultsComponent } from './components/profile/search-portal/search-portal-results/search-portal-results.component';
import { CustomPaginatorIntlComponent } from './components/profile/search-portal/custom-paginator-intl/custom-paginator-intl.component';
import { countFieldItemsPipe } from './pipes/count-field-items.pipe';
import { MydataBetaInfoComponent } from './components/mydata-beta-info/mydata-beta-info.component';
import { ProfileSummaryComponent } from './components/profile/profile-summary/profile-summary.component';
import { JoinDataSourcesPipe } from './pipes/join-data-sources.pipe';
import { FindSelectedItemPipe } from './pipes/find-selected-item.pipe';
import { HandleFetchedPublicationsPipe } from './pipes/handle-fetched-publications.pipe';
import { SortPublicationsPipe } from './pipes/sort-publications.pipe';
import { MyDataTerms } from './components/mydata-terms/mydata-terms.component';
import { DraftSummaryComponent } from './components/profile/draft-summary/draft-summary.component';
import { ContactCardComponent } from './components/profile/cards/contact-card/contact-card.component';
import { CollaborationCardComponent } from './components/profile/cards/collaboration-card/collaboration-card.component';
import { JoinAllGroupItemsPipe } from './pipes/join-all-group-items.pipe';
import { EmptyCardComponent } from './components/profile/cards/empty-card/empty-card.component';
import { SummaryAffiliationsComponent } from './components/profile/profile-summary/summary-affiliations/summary-affiliation.component';
import { SummaryDividerComponent } from './components/profile/profile-summary/summary-divider/summary-divider.component';
import { GetItemsByPipe } from './pipes/get-items-by.pipe';
import { SortByFieldTypePipe } from './pipes/sort-by-field-type.pipe';
import { MatchItemPipe } from './pipes/match-item.pipe';
import { ProfileEditorCardHeaderComponent } from './components/profile/cards/profile-editor-card-header/profile-editor-card-header.component';
import { JoinValuesPipe } from './pipes/join-values.pipe';
import { GetValuePipe } from './pipes/get-value.pipe';
import { PortalModule } from '@portal/portal.module';
import { HasFetchedItemPipe } from './pipes/has-fetched-item.pipe';
import { HasSelectedItemsPipe } from './pipes/has-selected-items.pipe';
import { SummaryPortalItemsComponent } from './components/profile/profile-summary/summary-portal-items/summary-portal-items.component';
import { ServiceDeploymentComponent } from './components/service-deployment/service-deployment.component';
import { ServiceTermsComponent } from './components/service-deployment/service-terms/service-terms.component';
import { CancelDeploymentComponent } from './components/service-deployment/cancel-deployment/cancel-deployment.component';
import { OrcidLoginComponent } from './components/service-deployment/orcid-login/orcid-login.component';
import { OrcidDataFetchComponent } from './components/service-deployment/orcid-data-fetch/orcid-data-fetch.component';
import { WelcomeDialogComponent } from './components/profile/welcome-dialog/welcome-dialog.component';
import { DataSourcesComponent } from './components/profile/data-sources/data-sources.component';
import { DataSourcesTableComponent } from './components/profile/data-sources/data-sources-table/data-sources-table.component';
import { DataSourcesFiltersComponent } from './components/profile/data-sources/data-sources-filters/data-sources-filters.component';
import { DataSourcesSelectionActionsComponent } from './components/profile/data-sources/data-sources-selection-actions/data-sources-selection-actions.component';
import { FindByKeyValuePipe } from './pipes/find-by-key-value.pipe';
import { WelcomeStepperComponent } from './components/welcome-stepper/welcome-stepper.component';
import { MatStepperModule } from '@angular/material/stepper';
import { AccountSettingsComponent } from './components/account-settings/account-settings.component';
import { ProfileItemsTableComponent } from './components/profile/profile-items-table/profile-items-table.component';
import { IsPortalItemPipe } from './pipes/is-portal-item.pipe';

const matSnackbarDefaultConfig: MatSnackBarConfig = {
  verticalPosition: 'top',
  horizontalPosition: 'center',
  duration: 3000,
};

@NgModule({
  declarations: [
    HomeComponent,
    NotFoundComponent,
    RedirectComponent,
    LoginComponent,
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
    SearchPortalComponent,
    SearchPortalResultsComponent,
    MydataBetaInfoComponent,
    ProfileSummaryComponent,
    JoinDataSourcesPipe,
    FindSelectedItemPipe,
    HandleFetchedPublicationsPipe,
    SortPublicationsPipe,
    MyDataTerms,
    DraftSummaryComponent,
    ContactCardComponent,
    CollaborationCardComponent,
    JoinAllGroupItemsPipe,
    EmptyCardComponent,
    SummaryAffiliationsComponent,
    SummaryDividerComponent,
    GetItemsByPipe,
    SortByFieldTypePipe,
    MatchItemPipe,
    ProfileEditorCardHeaderComponent,
    JoinValuesPipe,
    GetValuePipe,
    HasFetchedItemPipe,
    SummaryPortalItemsComponent,
    ServiceDeploymentComponent,
    ServiceTermsComponent,
    CancelDeploymentComponent,
    OrcidLoginComponent,
    OrcidDataFetchComponent,
    WelcomeDialogComponent,
    HasSelectedItemsPipe,
    countFieldItemsPipe,
    DataSourcesComponent,
    DataSourcesTableComponent,
    DataSourcesFiltersComponent,
    DataSourcesSelectionActionsComponent,
    FindByKeyValuePipe,
    WelcomeStepperComponent,
    AccountSettingsComponent,
    ProfileItemsTableComponent,
    IsPortalItemPipe,
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
    MatMenuModule,
    PortalModule,
    MatStepperModule,
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
