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

import { SecondaryButtonComponent } from './components/secondary-button/secondary-button.component';
import { PrimaryActionButtonComponent } from './components/primary-action-button/primary-action-button.component';
import { CloseButtonComponent } from './components/close-button/close-button.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { DividerComponent } from './components/divider/divider.component';
import { ButtonGroupComponent } from './components/button-group/button-group.component';
import { SelectComponent } from './components/select/select.component';
import { MenuComponent } from './components/menu/menu.component';
import { SearchComponent } from './components/search/search.component';

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
  ],
})
export class SharedModule {}
