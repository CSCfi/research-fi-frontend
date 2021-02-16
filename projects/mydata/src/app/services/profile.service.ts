import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { AppConfigService } from '../services/app-config-service.service';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  apiUrl: string;
  httpOptions: object;

  constructor(private http: HttpClient, private oauthService: OAuthService, private appConfig: AppConfigService) {
    this.apiUrl = this.appConfig.apiUrl;
    const token = this.oauthService.getAccessToken();

    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }),
    };
  }

  createProfile() {
    return this.http.post(this.apiUrl + 'researcherprofile/', this.httpOptions);
  }

  deleteProfile() {
    return this.http.delete(
      this.apiUrl + 'researcherprofile/',
      this.httpOptions
    );
  }
}
