//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { UtilityService } from '@shared/services/utility.service';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { SecondaryButtonComponent } from '../../../shared/components/buttons/secondary-button/secondary-button.component';
import { MyDataTerms } from '../mydata-terms/mydata-terms.component';
import { FormsModule } from '@angular/forms';
import { MatCheckbox } from '@angular/material/checkbox';
import { PrimaryActionButtonComponent } from '../../../shared/components/buttons/primary-action-button/primary-action-button.component';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    standalone: true,
    imports: [
        NgIf,
        PrimaryActionButtonComponent,
        MatCheckbox,
        FormsModule,
        MyDataTerms,
        SecondaryButtonComponent,
        RouterLink,
    ],
})
export class LoginComponent implements OnInit {
  title = $localize`:@@serviceDeployment:Profiilityökalun käyttöönotto - Tutkijan tiedot`;
  textContent: string;
  locale: string;
  loginStep = 1;

  constructor(
    public oidcSecurityService: OidcSecurityService,
    private utilityService: UtilityService,
    private route: ActivatedRoute,
    private appSettingsService: AppSettingsService
  ) {
    this.locale = this.appSettingsService.capitalizedLocale;
  }

  ngOnInit(): void {
    // Get page content from CMS data
    this.textContent = this.route.snapshot.data.pages.find(
      (page) => page.id === 'mydata_create_profile'
    )['content' + this.locale];

    this.utilityService.setMyDataTitle(this.title);
  }

  login() {
    this.oidcSecurityService.authorize();
  }

  logout() {
    this.oidcSecurityService.logoff();
  }
}
