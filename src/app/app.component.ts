//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, HostListener, inject, Inject, PLATFORM_ID, TransferState } from '@angular/core';
import { DOCUMENT, isPlatformBrowser, JsonPipe, PlatformLocation, ViewportScroller } from '@angular/common';
import { AppConfigService } from '@shared/services/app-config-service.service';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { NavigationStart, Router, RouterOutlet } from '@angular/router';
import { take } from 'rxjs/operators';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { LayoutComponent } from './layout/layout.component';
import { ScrollingService } from '@portal/services/scrolling.service';
import { ResizeService } from '@shared/services/resize.service';
import { IconService } from '@portal/services/IconService';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: true,
  imports: [LayoutComponent, RouterOutlet, JsonPipe]
})
export class AppComponent {
  iconAndScrollService = inject(ScrollingService);
  iconService = inject(IconService);
  transferedState = inject(TransferState);

  title = 'research-fi-portal';

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    if (isPlatformBrowser(this.platformId)) {
      this.resizeService.updateScreenSize(window.innerWidth, window.innerHeight);
    }
  }

  constructor(
    private appConfigService: AppConfigService,
    private oidcSecurityService: OidcSecurityService,
    private appSettingsService: AppSettingsService,
    private resizeService: ResizeService,
    private router: Router,
    private platform: PlatformLocation,
    private viewPortScroller: ViewportScroller,
    @Inject(PLATFORM_ID) private platformId: object,
    @Inject(DOCUMENT) private document: any,
  ) {
    // SSR platform check
    if (isPlatformBrowser(this.platformId)) {
      this.resizeService.updateScreenSize(window.innerWidth, window.innerHeight);
      // APM config
      // const apm = apmService.init({
      //   serviceName: 'Angular',
      //   serverUrl: this.appConfigService.apmUrl,
      //   environment: this.appConfigService.environmentName,
      //   eventsLimit: 10,
      //   transactionSampleRate: 0.1,
      //   disableInstrumentations: [
      //     // 'page-load',
      //     'history',
      //     'eventtarget',
      //     'xmlhttprequest',
      //     'fetch',
      //     // 'error'
      //   ],
      // });

      this.router.events.pipe(take(1)).subscribe((e) => {
        if (e instanceof NavigationStart) {
          if (isPlatformBrowser(this.platformId)) {
            // List of host identifiers for enablding or disabling content in matching host
            const allowedHostIdentifiers = [
              'localhost',
              'test',
              'qa',
              'mydata',
            ];

            const checkHostMatch = (host: string) =>
              this.platform.hostname.includes(host);

            if (!allowedHostIdentifiers.some(checkHostMatch)) {
              // Prevent development implementation of MyData routes in production
              // e.url.includes('/mydata') && this.router.navigate(['/']);
            } else {
              // Global flag for preventing predefined content in production
              this.appSettingsService.develop = true;
            }
          }

          // Start MyData auth process
          if (e.url.includes('/mydata')) {
            this.oidcSecurityService.checkAuth().subscribe(() => {});
          }
        }
      });

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

      this.document.addEventListener('mousemove', () =>
        document.body.classList.remove('focus-visible')
      );

      this.document.addEventListener(
        'keydown',
        ({ key }) =>
          key === 'Tab' && document.body.classList.add('focus-visible')
      );
    }
  }
}
