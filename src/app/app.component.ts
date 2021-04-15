//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { AppConfigService } from '@shared/services/app-config-service.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'research-fi-portal';
  siteId: number;

  constructor(
    public oidcSecurityService: OidcSecurityService,
    private appConfigService: AppConfigService,
    @Inject(PLATFORM_ID) private platformId: object,
    @Inject(DOCUMENT) private document: any
  ) {
    // SSR platform check
    if (isPlatformBrowser(this.platformId)) {
      // Start auth process
      this.oidcSecurityService
        .checkAuth()
        .subscribe((isAuthenticated) =>
          console.log('app authenticated', isAuthenticated)
        );

      // Add initial Matomo script with dynamic site ID
      const node = this.document.createElement('script');
      node.type = 'text/javascript';
      node.innerHTML = `
      var _paq = window._paq || [];
      _paq.push(['requireCookieConsent']);
      _paq.push(['trackPageView']);
      _paq.push(['enableLinkTracking']);
      (function () {
        var u = 'https://rihmatomo-analytics.csc.fi/';
        _paq.push(['setTrackerUrl', u + 'matomo.php']);
        _paq.push(['setSiteId', '${this.appConfigService.matomoSiteId}']);
        var d = document,
          g = d.createElement('script'),
          s = d.getElementsByTagName('script')[0];
        g.type = 'text/javascript';
        g.async = true;
        g.defer = true;
        g.src = u + 'matomo.js';
        s.parentNode.insertBefore(g, s);
      })();
      `;
      this.document.getElementsByTagName('head')[0].appendChild(node);
    }
  }
}
