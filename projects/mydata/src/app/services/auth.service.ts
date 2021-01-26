import { Injectable } from '@angular/core';
import { OAuthService, AuthConfig } from 'angular-oauth2-oidc';

export const authConfig: AuthConfig = {
  issuer: 'https://identitytest-ts.rahtiapp.fi',
  clientId: 'js',
  redirectUri: 'https://localhost:5003/welcome',
  responseType: 'code',
  scope: 'openid profile api1',
  logoutUrl: 'https://localhost:5003/',
  postLogoutRedirectUri: 'https://localhost:5003/',
  sessionChecksEnabled: true,
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private oauthService: OAuthService) {}

  configure() {
    this.oauthService.initCodeFlow();
    this.oauthService.configure(authConfig);
  }

  login() {
    this.configure();
    this.oauthService.loadDiscoveryDocumentAndTryLogin();
  }

  logout() {
    this.configure();
    this.oauthService.logOut();
  }
}
