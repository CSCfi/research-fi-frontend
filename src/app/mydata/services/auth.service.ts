import { Injectable } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { BehaviorSubject } from 'rxjs';
import { AppConfigService } from '../../shared/services/app-config-service.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authInitializedSubject = new BehaviorSubject(false);
  authInitialized = this.authInitializedSubject.asObservable();

  constructor(
    private oauthService: OAuthService,
    private appConfigService: AppConfigService
  ) {
    this.configure(this.appConfigService.myDataAuthConfig);
  }

  configure(authConfig) {
    this.oauthService.configure(authConfig);
    if (this.hasValidTokens()) {
      this.oauthService.loadDiscoveryDocumentAndTryLogin();
    }
  }

  login() {
    this.authInitializedSubject.next(true);
    this.oauthService.initCodeFlow();
    this.oauthService.loadDiscoveryDocumentAndTryLogin();
  }

  logout() {
    this.authInitializedSubject.next(true);
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
