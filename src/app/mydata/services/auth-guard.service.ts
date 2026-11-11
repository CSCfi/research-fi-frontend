//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { of, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OidcSecurityService } from 'angular-auth-oidc-client';

// Remove in production
import { AppSettingsService } from '@shared/services/app-settings.service';

// Session storage key for the page the user wanted before being sent to login; read in AppComponent
export const RETURN_URL_KEY = 'mydataReturnUrl';

// https://github.com/damienbod/angular-auth-oidc-client/blob/main/docs/guards.md
@Injectable({
  providedIn: 'root'
})
export class AuthGuard  {
  constructor(
    private readonly oidcSecurityService: OidcSecurityService,
    private router: Router,
    private appSettingsService: AppSettingsService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    // if (this.appSettingsService.myDataSettings.develop) return of(true);
    const handleUnauthorized = () => {
      // Partner links carry login=1 to skip the start page and go straight to login.
      // Browser only: authorize() and sessionStorage are not available during SSR.
      if (route.queryParams.login === '1' && isPlatformBrowser(this.platformId)) {
        // Strip the flag so it is not kept in the URL after login
        const tree = this.router.parseUrl(state.url);
        delete tree.queryParams.login;
        // authorize() leaves the app, so the target is stored for AppComponent to restore after login
        sessionStorage.setItem(RETURN_URL_KEY, this.router.serializeUrl(tree));
        this.oidcSecurityService.authorize();
        return false;
      }

      // No flag: send the user to the start page that explains the service
      this.router.navigate(['/mydata']);
      return false;
    };

    return this.oidcSecurityService.isAuthenticated().pipe(
      map((isAuthenticated) => {

        // Handling for service deployment.
        // Service deployment is divided into steps, current step number is in route query parameter 'step'.
        if (route.routeConfig.path === 'service-deployment') {
          const step = Number(route.queryParams.step);
          if (step > 2 && !isAuthenticated) {
            // Step 3 and onwards require authentication.
            // Return the result so the route does not activate (and run resolvers) while unauthenticated.
            return handleUnauthorized();
          }
          else {
            // Steps until 2 should be accessible without authentication.
            return true;
          }
        } else if (!isAuthenticated) {
          // In all other cases authentication is required.
          return handleUnauthorized();
        }

        return true;
      })
    );
  }
}
