// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from './layout/layout.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { AppRoutingModule } from '../app-routing.module';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { ErrorModalComponent } from './error-modal/error-modal.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ClickOutsideModule } from 'ng-click-outside';
import { BetaReviewComponent } from './beta-review/beta-review.component';
import { BetaInfoComponent } from './beta-info/beta-info.component';

@NgModule({
  declarations: [LayoutComponent, HeaderComponent, FooterComponent, ErrorModalComponent, BetaReviewComponent, BetaInfoComponent],
  imports: [
    CommonModule,
    AppRoutingModule,
    MatSelectModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    FontAwesomeModule,
    ClickOutsideModule
  ],
  exports: [LayoutComponent],
  entryComponents: [BetaReviewComponent]
})
export class UiModule { }
