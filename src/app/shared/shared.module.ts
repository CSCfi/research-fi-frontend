// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { NgModule } from '@angular/core';
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

import { CollapseModule } from 'ngx-bootstrap/collapse';

import { SecondaryButtonComponent } from './components/secondary-button/secondary-button.component';
import { PrimaryActionButtonComponent } from './components/primary-action-button/primary-action-button.component';
import { CloseButtonComponent } from './components/close-button/close-button.component';
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
  ],
  imports: [
    CommonModule,
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
    CollapseModule.forRoot(),
  ],
})
export class SharedModule {}
