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
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OidcSecurityService } from 'angular-auth-oidc-client';

// https://github.com/damienbod/angular-auth-oidc-client/blob/main/docs/guards.md
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly oidcSecurityService: OidcSecurityService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.oidcSecurityService.isAuthenticated$.pipe(
      map((isAuthorized: boolean) => {
        console.log(
          'AuthorizationGuard, canActivate isAuthorized: ' + isAuthorized
        );

        if (!isAuthorized) {
          this.router.navigate(['/mydata']);
          return false;
        }

        return true;
      })
    );
  }
}
