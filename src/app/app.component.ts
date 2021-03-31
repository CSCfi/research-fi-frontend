//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'research-fi-portal';

  constructor(
    public oidcSecurityService: OidcSecurityService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.oidcSecurityService
        .checkAuth()
        .subscribe((isAuthenticated) =>
          console.log('app authenticated', isAuthenticated)
        );
    }
  }
}
