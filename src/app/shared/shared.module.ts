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
import { SecondaryButtonComponent } from './components/secondary-button/secondary-button.component';
import { PrimaryActionButtonComponent } from './components/primary-action-button/primary-action-button.component';
import { CloseButtonComponent } from './components/close-button/close-button.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { DividerComponent } from './components/divider/divider.component';
import { MatRippleModule } from '@angular/material/core';

@NgModule({
  declarations: [
    InfoComponent,
    SecondaryButtonComponent,
    PrimaryActionButtonComponent,
    CloseButtonComponent,
    NotFoundComponent,
    DividerComponent,
    MatRippleModule,
  ],
  exports: [
    InfoComponent,
    SecondaryButtonComponent,
    PrimaryActionButtonComponent,
    CloseButtonComponent,
    DividerComponent,
  ],
  imports: [CommonModule, FontAwesomeModule],
})
export class SharedModule {}
