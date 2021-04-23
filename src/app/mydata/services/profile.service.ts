//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { AppConfigService } from 'src/app/shared/services/app-config-service.service';
import { Orcid, OrcidAdapter } from '@mydata/models/orcid.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  apiUrl: string;
  httpOptions: object;

  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService,
    public oidcSecurityService: OidcSecurityService,
    private orcidAdapter: OrcidAdapter
  ) {
    this.apiUrl = this.appConfigService.profileApiUrl;
  }

  updateTokenInHttpAuthHeader() {
    var token = this.oidcSecurityService.getToken();

    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }),
      observe: 'response',
    };
  }

  checkProfileExists() {
    this.updateTokenInHttpAuthHeader();
    return this.http.get(this.apiUrl + '/researcherprofile/', this.httpOptions);
  }

  createProfile() {
    this.updateTokenInHttpAuthHeader();
    return this.http.post(
      this.apiUrl + '/researcherprofile/',
      null,
      this.httpOptions
    );
  }

  deleteProfile() {
    this.updateTokenInHttpAuthHeader();
    return this.http.delete(
      this.apiUrl + '/researcherprofile/',
      this.httpOptions
    );
  }

  getOrcidData() {
    this.updateTokenInHttpAuthHeader();
    return this.http.get(this.apiUrl + '/orcid/', this.httpOptions);
  }

  getProfileData() {
    this.updateTokenInHttpAuthHeader();
    return this.http
      .get<Orcid[]>(this.apiUrl + '/profiledata/', this.httpOptions)
      .pipe(map((data) => this.orcidAdapter.adapt(data)));
  }

  patchProfileDataSingle(modificationItem) {
    this.updateTokenInHttpAuthHeader();
    let body = [modificationItem];
    return this.http.patch(
      this.apiUrl + '/profiledata/',
      body,
      this.httpOptions
    );
  }
}
