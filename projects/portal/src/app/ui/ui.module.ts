// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonComponentsModule } from '../common-components/common-components.module';
import { LayoutComponent } from './layout/layout.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { AppRoutingModule } from '../app-routing.module';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule  } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { ErrorModalComponent } from './error-modal/error-modal.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ClickOutsideModule } from 'ng-click-outside';
import { ReviewComponent } from './review/review.component';
import { BetaInfoComponent } from './beta-info/beta-info.component';
import { CookieConsentComponent } from './cookie-consent/cookie-consent.component';
import { WINDOW_PROVIDERS } from '@portal.services/window.service';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { UiLibraryModule } from 'ui-library';

@NgModule({
  declarations: [LayoutComponent, HeaderComponent, FooterComponent, ErrorModalComponent, ReviewComponent, BetaInfoComponent,
    CookieConsentComponent],
  imports: [
    CommonModule,
    CommonComponentsModule,
    AppRoutingModule,
    MatSelectModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatRadioModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    FormsModule,
    FontAwesomeModule,
    ClickOutsideModule,
    TooltipModule.forRoot(),
    UiLibraryModule,
  ],
  exports: [LayoutComponent],
  entryComponents: [ReviewComponent],
  providers: [WINDOW_PROVIDERS],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
  ]
})
export class UiModule { }
