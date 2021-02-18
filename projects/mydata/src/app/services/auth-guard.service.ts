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

  async canActivate(): Promise<boolean> {
    if (this.authService.hasValidTokens()) {
      return Promise.resolve(true);
    }

    await this.oauthService.loadDiscoveryDocumentAndTryLogin();

    const valid = this.authService.hasValidTokens();

    valid
      ? this.router.navigate(['/welcome'])
      : this.router.navigate(['/login']);

    return valid;
  }
}
