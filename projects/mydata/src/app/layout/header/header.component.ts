// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import {
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';
import { Subscription } from 'rxjs/internal/Subscription';
import { AuthService } from '../../services/auth.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent implements OnInit {
  lang = 'fi';
  currentRoute: string;
  navItems = [{ label: 'Kirjaudu sisään', link: '' }];
  routeSub: Subscription;
  params: any;
  loggedIn: boolean;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private oauthService: OAuthService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.routeEvent(router);
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loggedIn =
        sessionStorage.getItem('PKCE_verifier') === null ? false : true;
    }

    this.oauthService.events.subscribe((e) => {
      switch (e.type) {
        case 'token_received': {
          console.log('Token received');
          this.oauthService.loadUserProfile();
          this.authService.setTokenReceived();
          break;
        }
        case 'discovery_document_loaded': {
          if (this.oauthService.hasValidAccessToken()) {
            console.log('Token available');
            this.authService.setTokenReceived();
          }
        }
        case 'session_terminated': {
          console.log('Your session has been terminated!');
          break;
        }
      }
    });
  }

  // Get current url
  routeEvent(router: Router) {
    this.routeSub = router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        // Prevent multiple anchors
        this.route.queryParams.subscribe((params) => {
          this.params = params;
          // Remove consent param
          if (params.consent) {
            this.router.navigate([], {
              queryParams: {
                consent: null,
              },
              queryParamsHandling: 'merge',
              replaceUrl: true,
            });
          }
        });
        this.currentRoute = e.urlAfterRedirects.split('#')[0];
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}
