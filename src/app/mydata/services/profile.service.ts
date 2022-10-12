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
import { AppSettingsService } from '@shared/services/app-settings.service';
import { Constants } from '@mydata/constants';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  apiUrl: string;
  httpOptions: object;
  currentProfileData: any[];

  testData = testData;

  /*
   * Flag for preventing profile view from populating patch payload
   * when draft has been initialized. Profile view initialization
   * would overwrite patch payload without the flag.
   */
  profileInitialized = false;

  private editorProfileNameSource = new BehaviorSubject<string>('');
  currentEditorProfileName = this.editorProfileNameSource.asObservable();

  private userDataSource = new Subject<Record<string, unknown>>();
  userData = this.userDataSource.asObservable();
  orcidUserProfile: Record<string, unknown>; // Set via orcid-profile-resolver

  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService,
    public oidcSecurityService: OidcSecurityService,
    private profileAdapter: ProfileAdapter,
    private errorHandlerService: ErrorHandlerService,
    private appSettingsService: AppSettingsService
  ) {
    this.apiUrl = this.appConfigService.profileApiUrl;
  }

  updateTokenInHttpAuthHeader(options?: { bypassOrcidCheck: boolean }) {
    const token = this.oidcSecurityService.getAccessToken();

    const idTokenPayload = this.oidcSecurityService.getPayloadFromIdToken();

    if (!token) {
      return this.setErrorMessage(
        'Autentikointi-avain ei saatavilla. Pyyntö estetty.'
      );
    }

    if (!options?.bypassOrcidCheck && !idTokenPayload.orcid) {
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

  setErrorMessage(errorMessage: string) {
    this.errorHandlerService.updateError({
      message: errorMessage,
    });
  }

  handleOrcidNotLinked() {
    return this.setErrorMessage(
      'ORCID-tiliä ei ole linkitetty. Toiminto ei ole sallittu.'
    );
  }

  setOrcidUserProfile(profileData) {
    this.orcidUserProfile = profileData;
  }

  setEditorProfileName(fullName: string) {
    // Capitalize first letters of names with startCase function
    this.editorProfileNameSource.next(startCase(fullName));
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

  /*
   * Keycloak account is created after succesful Suomi.fi authentication.
   * Delete this account if user cancels service deployment.
   */
  deleteAccount() {
    this.updateTokenInHttpAuthHeader({ bypassOrcidCheck: true });
    return this.http.delete(this.apiUrl + '/accountdelete/', this.httpOptions);
  }

  getOrcidData() {
    this.updateTokenInHttpAuthHeader();
    return this.http.get(this.apiUrl + '/orcid/', this.httpOptions);
  }

  getProfileData() {
    this.updateTokenInHttpAuthHeader();
    return this.http
      .get<Profile[]>(this.apiUrl + '/profiledata2/', this.httpOptions)
      .pipe(map((data) => this.profileAdapter.adaptNew(data)));
  }

  // Draft profile is stored in session storage
  getDraftProfile() {
    if (this.appSettingsService.isBrowser) {
      return sessionStorage.getItem(Constants.draftProfile);
    }
  }

  patchObjects(items) {
    this.updateTokenInHttpAuthHeader();
    let body = { groups: [], items: items };
    return this.http.patch(
      this.apiUrl + '/profiledata2/',
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
    this.updateTokenInHttpAuthHeader({ bypassOrcidCheck: true });
    return this.http.get(this.apiUrl + '/accountlink/', this.httpOptions);
  }
}
