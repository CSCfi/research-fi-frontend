import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AppConfigService } from 'src/app/shared/services/app-config-service.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authInitializedSubject = new BehaviorSubject(false);
  authInitialized = this.authInitializedSubject.asObservable();

  constructor(private appConfigService: AppConfigService) {
    // this.configure(this.appConfigService.myDataAuthConfig);
  }

  // configure(authConfig) {
  //   this.oauthService.configure(authConfig);
  //   if (this.hasValidTokens()) {
  //     this.oauthService.loadDiscoveryDocumentAndTryLogin();
  //   }
  // }

  login() {
    this.authInitializedSubject.next(true);
  }

  logout() {
    this.authInitializedSubject.next(true);
  }

  getAccessToken() {}

  getUserData() {}
}
