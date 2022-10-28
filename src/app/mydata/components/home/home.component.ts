//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit } from '@angular/core';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { UtilityService } from '@shared/services/utility.service';
import { OidcSecurityService } from 'angular-auth-oidc-client';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  title = $localize`:@@home:Etusivu`;
  locale: string;

  constructor(
    public oidcSecurityService: OidcSecurityService,
    private utilityService: UtilityService,
    private appSettingsService: AppSettingsService
  ) {}

  ngOnInit() {
    this.utilityService.setMyDataTitle(this.title);
    // Fallback until we get swedish visualization
    this.locale =
      this.appSettingsService.currentLocale === 'sv'
        ? 'en'
        : this.appSettingsService.currentLocale;
  }

  login() {
    this.oidcSecurityService.authorize();
  }
}
