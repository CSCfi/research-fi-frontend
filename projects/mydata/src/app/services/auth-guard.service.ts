import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private oauthService: OAuthService,
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Promise<boolean> {
    if (this.authService.hasValidTokens()) {
      return Promise.resolve(true);
    }

    return this.oauthService
      .loadDiscoveryDocumentAndTryLogin()
      .then((_) => {
        return this.authService.hasValidTokens();
      })
      .then((valid) => {
        this.router.navigate(['/welcome']);
        if (!valid) {
          this.router.navigate(['/login']);
        }
        return valid;
      });
  }
}
