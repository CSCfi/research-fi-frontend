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
import { Profile, ProfileAdapter } from '@mydata/models/profile.model';
import { map } from 'rxjs/operators';
import testData from 'src/testdata/mydataprofiledata.json';
import { BehaviorSubject, Subject } from 'rxjs';
import { startCase } from 'lodash-es';
import { ErrorHandlerService } from '@shared/services/error-handler.service';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  apiUrl: string;
  httpOptions: object;
  currentProfileData: any[];

  testData = testData;

  private currentProfileNameSource = new BehaviorSubject<string>('');
  currentProfileName = this.currentProfileNameSource.asObservable();

  private userDataSource = new Subject<string>();
  userData = this.userDataSource.asObservable();

  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService,
    public oidcSecurityService: OidcSecurityService,
    private profileAdapter: ProfileAdapter,
    private errorHandlerService: ErrorHandlerService
  ) {
    this.apiUrl = this.appConfigService.profileApiUrl;
  }

  updateTokenInHttpAuthHeader(bypassOrcidCheck = false) {
    const token = this.oidcSecurityService.getToken();

    const idTokenPayload = this.oidcSecurityService.getPayloadFromIdToken();

    if (!bypassOrcidCheck && !idTokenPayload.orcid) {
      return this.handleOrcidNotLinked();
    }

    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }),
      observe: 'response',
    };
  }

  handleOrcidNotLinked() {
    this.errorHandlerService.updateError({
      message: 'ORCID-tiliä ei ole linkitetty. Toiminto ei ole sallittu.',
    });
  }

  setCurrentProfileName(fullName: string) {
    // Capitalize first letters of names with startCase function
    this.currentProfileNameSource.next(startCase(fullName));
  }

  setCurrentProfileData(data) {
    this.currentProfileData = data;
  }

  setUserData(data: any) {
    this.userDataSource.next(data);
  }

  checkProfileExists() {
    this.updateTokenInHttpAuthHeader();
    return this.http.get(this.apiUrl + '/userprofile/', this.httpOptions);
  }

  createProfile() {
    this.updateTokenInHttpAuthHeader();
    return this.http.post(
      this.apiUrl + '/userprofile/',
      null,
      this.httpOptions
    );
  }

  deleteProfile() {
    this.updateTokenInHttpAuthHeader();
    return this.http.delete(this.apiUrl + '/userprofile/', this.httpOptions);
  }

  getOrcidData() {
    this.updateTokenInHttpAuthHeader();
    return this.http.get(this.apiUrl + '/orcid/', this.httpOptions);
  }

  getProfileData() {
    this.updateTokenInHttpAuthHeader();
    return this.http
      .get<Profile[]>(this.apiUrl + '/profiledata/', this.httpOptions)
      .pipe(map((data) => this.profileAdapter.adapt(data)));
  }

  patchObjects(items) {
    this.updateTokenInHttpAuthHeader();
    let body = { groups: [], items: items };
    return this.http.patch(
      this.apiUrl + '/profiledata/',
      body,
      this.httpOptions
    );
  }

  patchProfileDataSingleGroup(group) {
    this.updateTokenInHttpAuthHeader();
    let body = { groups: group, items: [] };
    return this.http.patch(
      this.apiUrl + '/profiledata/',
      body,
      this.httpOptions
    );
  }

  patchProfileDataSingleItem(item) {
    this.updateTokenInHttpAuthHeader();
    let body = { groups: [], items: item };
    return this.http.patch(
      this.apiUrl + '/profiledata/',
      body,
      this.httpOptions
    );
  }

  /*
   * Trigger ORCID attribute handling in Keycloak.
   * Keycloak will add attribute 'orcid' into user's
   * access and id tokens.
   */
  accountlink() {
    this.updateTokenInHttpAuthHeader(true);
    return this.http.get(this.apiUrl + '/accountlink/', this.httpOptions);
  }
}
