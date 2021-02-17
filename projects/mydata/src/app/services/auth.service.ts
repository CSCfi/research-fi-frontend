import { Injectable } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private tokenReceivedSubject = new BehaviorSubject(false);
  tokenReceived = this.tokenReceivedSubject.asObservable();

  constructor(private oauthService: OAuthService) {}

  login() {
    this.oauthService.initCodeFlow();
    this.oauthService.loadDiscoveryDocumentAndTryLogin();
  }

  logout() {
    this.oauthService.loadDiscoveryDocumentAndTryLogin().then(() => {
      this.oauthService.logOut();
    });
  }

  setTokenReceived() {
    this.tokenReceivedSubject.next(true);
  }
}
