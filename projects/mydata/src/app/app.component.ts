import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import {
  NavigationEnd,
  NavigationStart,
  Router,
  RouterEvent,
} from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { OAuthService } from 'angular-oauth2-oidc';
import { filter } from 'rxjs/operators';
import { AppConfigService } from './services/app-config-service.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'mydata';
  loading: boolean;
  isBrowser: boolean;

  constructor(
    private router: Router,
    private oauthService: OAuthService,
    private appConfig: AppConfigService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.configureAuth(appConfig.authConfig);

    this.oauthService.events
      .pipe(filter((e) => e.type === 'token_received'))
      .subscribe((_) => {
        console.debug('state', this.oauthService.state);
        this.oauthService.loadUserProfile();
      });
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.isBrowser = true;
    }
    this.routerEvents();
  }

  private configureAuth(authConfig) {
    this.oauthService.configure(authConfig);
    this.oauthService.loadDiscoveryDocumentAndTryLogin();
  }

  // Set loading indicator. This is useful for pages that rely on resolvers
  routerEvents() {
    this.router.events.subscribe((event: RouterEvent) => {
      switch (true) {
        case event instanceof NavigationStart: {
          this.loading = true;
          break;
        }
        case event instanceof NavigationEnd: {
          this.loading = false;
          break;
        }
      }
    });
  }
}
