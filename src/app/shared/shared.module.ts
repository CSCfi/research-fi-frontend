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
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
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
  ],
  providers: [CutContentPipe],
})
export class SharedModule {}
