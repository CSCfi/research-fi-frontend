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
  navItems = [{ label: 'Kirjaudu sisään', link: '', function: true }];
  localizedDomains = [
    { label: 'Suomi', locale: 'fi', url: 'https://localhost:5003/fi' },
    { label: 'Svenska', locale: 'sv', url: 'https://localhost:5003/sv' },
    { label: 'English', locale: 'en', url: 'https://localhost:5003/en' },
  ];
  routeSub: Subscription;
  params: any;
  loggedIn: boolean;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.routeEvent(router);

    router.events.forEach(() => {
      if (this.authService.hasValidTokens()) {
        this.loggedIn = true;
        this.navItems[0].label = 'Kirjaudu ulos';
      } else {
        this.loggedIn = true;
        this.navItems[0].label = 'Kirjaudu sisään';
      }
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loggedIn =
        sessionStorage.getItem('PKCE_verifier') === null ? false : true;
    }
  }

  navItemClickHandler(event) {
    this.authService.hasValidTokens() ? this.logout() : this.login();
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
        this.currentRoute = e.urlAfterRedirects.split('?')[0];
        console.log(e.urlAfterRedirects);
      }
    });
  }

  login() {
    this.authService.login();
  }

  logout() {
    this.authService.logout();
  }
}
