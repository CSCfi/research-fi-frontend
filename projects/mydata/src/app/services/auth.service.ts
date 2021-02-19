import { Injectable } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { AppConfigService } from './app-config-service.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private oauthService: OAuthService,
    private appConfigService: AppConfigService
  ) {
    this.configure(this.appConfigService.authConfig);
  }

  configure(authConfig) {
    this.oauthService.configure(authConfig);
    if (this.hasValidTokens()) {
      this.oauthService.loadDiscoveryDocumentAndTryLogin();
    }
  }

  login() {
    this.oauthService.initCodeFlow();
    this.oauthService.loadDiscoveryDocumentAndTryLogin();
  }

  logout() {
    this.oauthService.logOut();
  }

  hasValidTokens() {
    return (
      this.oauthService.hasValidIdToken() &&
      this.oauthService.hasValidAccessToken()
    );
  }

  getAccessToken() {
    return this.oauthService.getAccessToken();
  }

  getUserData() {
    const jwt = this.oauthService.getIdToken();
    const tokens = jwt.split('.');
    const userData = JSON.parse(atob(tokens[1]));
    return {
      name: userData?.name,
      orcidId: userData?.orcid,
    };
  }
}
