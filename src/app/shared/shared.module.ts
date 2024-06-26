// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InfoComponent } from './components/info/info.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatRippleModule } from '@angular/material/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatSortModule } from '@angular/material/sort';

import { CollapseModule } from 'ngx-bootstrap/collapse';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { SecondaryButtonComponent } from './components/buttons/secondary-button/secondary-button.component';
import { PrimaryActionButtonComponent } from './components/buttons/primary-action-button/primary-action-button.component';
import { CloseButtonComponent } from './components/buttons/close-button/close-button.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { DividerComponent } from './components/divider/divider.component';
import { ButtonGroupComponent } from './components/button-group/button-group.component';
import { SelectComponent } from './components/select/select.component';
import { MenuComponent } from './components/menu/menu.component';
import { SearchComponent } from './components/search/search.component';
import { ReviewComponent } from './components/review/review.component';

import { ThousandSeparatorPipe } from './pipes/thousand-separator.pipe';
import { CutContentPipe } from './pipes/cut-content.pipe';
import { SanitizeHtmlPipe } from './pipes/sanitize-html.pipe';
import { DialogComponent } from './components/dialog/dialog.component';
import { DialogTemplateComponent } from './components/dialog/dialog-template/dialog-template.component';
import { BannerDividerComponent } from './components/banner-divider/banner-divider.component';

import { ClickOutsideDirective } from './directives/click-outside.directive';
import { NotificationBannerComponent } from './components/notification-banner/notification-banner.component';
import { TableComponent } from './components/table/table.component';
import { TableCellComponent } from './components/table/table-cell/table-cell.component';
import { ActiveFiltersListComponent } from './components/active-filters-list/active-filters-list.component';
import { ActiveFiltersDialogComponent } from './components/active-filters-list/active-filters-dialog/active-filters-dialog.component';
import { TableCardComponent } from './components/table/table-card/table-card.component';
import { SortByButtonComponent } from './components/buttons/sort-by-button/sort-by-button.component';
import { PaginationComponent } from './components/pagination/pagination.component';
import { ResultCountComponent } from './components/result-count/result-count.component';
import { AutofocusDirective } from './directives/autofocus.directive';
import { TagComponent } from './components/tag/tag.component';
import { TagDoiComponent } from './components/tags/tag-doi/tag-doi.component';
import { TagOpenAccessComponent } from './components/tags/tag-open-access/tag-open-access.component';
import { TagPeerReviewedComponent } from './components/tags/tag-peer-reviewed/tag-peer-reviewed.component';
import { TrimLinkPrefixPipe } from './pipes/trim-link-prefix.pipe';
import { JoinItemsPipe } from './pipes/join-items.pipe';

import { OrcidComponent } from '../shared/components/orcid/orcid.component';
import { WelcomeStepperComponent } from '@mydata/components/welcome-stepper/welcome-stepper.component';
import { MatStepperModule } from '@angular/material/stepper';

@NgModule({
  declarations: [
    InfoComponent,
    SecondaryButtonComponent,
    PrimaryActionButtonComponent,
    CloseButtonComponent,
    NotFoundComponent,
    DividerComponent,
    ButtonGroupComponent,
    SelectComponent,
    MenuComponent,
    SearchComponent,
    ReviewComponent,
    ThousandSeparatorPipe,
    CutContentPipe,
    SanitizeHtmlPipe,
    DialogComponent,
    DialogTemplateComponent,
    BannerDividerComponent,
    ClickOutsideDirective,
    NotificationBannerComponent,
    TableComponent,
    TableCellComponent,
    ActiveFiltersListComponent,
    ActiveFiltersDialogComponent,
    TableCardComponent,
    SortByButtonComponent,
    PaginationComponent,
    ResultCountComponent,
    AutofocusDirective,
    TagComponent,
    TagDoiComponent,
    TagOpenAccessComponent,
    TagPeerReviewedComponent,
    TrimLinkPrefixPipe,
    JoinItemsPipe,
    OrcidComponent,
    WelcomeStepperComponent,
  ],
  exports: [
    InfoComponent,
    SecondaryButtonComponent,
    PrimaryActionButtonComponent,
    CloseButtonComponent,
    DividerComponent,
    ButtonGroupComponent,
    SelectComponent,
    MenuComponent,
    SearchComponent,
    ReviewComponent,
    ThousandSeparatorPipe,
    CutContentPipe,
    SanitizeHtmlPipe,
    DialogComponent,
    BannerDividerComponent,
    ClickOutsideDirective,
    NotificationBannerComponent,
    TableComponent,
    ActiveFiltersListComponent,
    SortByButtonComponent,
    PaginationComponent,
    ResultCountComponent,
    AutofocusDirective,
    TagComponent,
    TagDoiComponent,
    TagOpenAccessComponent,
    TagPeerReviewedComponent,
    TrimLinkPrefixPipe,
    JoinItemsPipe,
    OrcidComponent,
    WelcomeStepperComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    MatRippleModule,
    MatButtonToggleModule,
    MatRadioModule,
    MatCheckboxModule,
    MatSelectModule,
    MatFormFieldModule,
    MatMenuModule,
    MatButtonModule,
    MatInputModule,
    MatDialogModule,
    MatTableModule,
    MatSortModule,
    CollapseModule.forRoot(),
    TooltipModule.forRoot(),
    MatStepperModule,
  ],
  providers: [CutContentPipe],
})
export class SharedModule {}
