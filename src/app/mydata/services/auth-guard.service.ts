//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { of, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OidcSecurityService } from 'angular-auth-oidc-client';

// Remove in production
import { AppSettingsService } from '@shared/services/app-settings.service';

// https://github.com/damienbod/angular-auth-oidc-client/blob/main/docs/guards.md
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly oidcSecurityService: OidcSecurityService,
    private router: Router,
    private appSettingsService: AppSettingsService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    // if (this.appSettingsService.myDataSettings.develop) return of(true);
    const handleUnauthorized = () => {
      this.router.navigate(['/mydata']);
      return false;
    };

    return this.oidcSecurityService.isAuthenticated$.pipe(
      map(({ isAuthenticated }) => {
        // Handling for service deployment
        if (route.routeConfig.path === 'service-deployment') {
          const step = Number(route.queryParams.step);
          if (step > 2 && !isAuthenticated) {
            handleUnauthorized();
          }
        } else if (!isAuthenticated) {
          handleUnauthorized();
        }

        return true;
      })
    );
  }
}
