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
import { ErrorModalComponent } from './error-modal/error-modal.component';

@NgModule({
  declarations: [LayoutComponent, HeaderComponent, FooterComponent, ErrorModalComponent],
  imports: [
    CommonModule,
    AppRoutingModule,
    MatSelectModule
  ],
  exports: [LayoutComponent]
})
export class UiModule { }
