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
import testData from 'src/testdata/mydataprofiledata.json';
import { BehaviorSubject, firstValueFrom, Subject} from 'rxjs';
import { ErrorHandlerService } from '@shared/services/error-handler.service';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { Constants } from '@mydata/constants';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  apiUrl: string;
  httpOptions: any;
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

  async updateToken(options?: { bypassOrcidCheck: boolean }): Promise<any> {
    await firstValueFrom(this.oidcSecurityService.getAccessToken()).then((token) => {
      if (!token) {
        return this.setErrorMessage(
          'Autentikointiavain ei saatavilla. Pyyntö estetty.'
        );
      }
      this.httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        }),
      };
    });
    if (!options?.bypassOrcidCheck) {
      await firstValueFrom(this.oidcSecurityService.getPayloadFromIdToken()).then((token) => {
        if (!token.orcid){
          return this.handleOrcidNotLinked();
        }
      });
    }
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
    this.editorProfileNameSource.next(fullName);
  }

  setCurrentProfileData(data) {
    this.currentProfileData = data;
  }

  setUserData(data: any) {
    this.userDataSource.next(data);
  }

  async checkProfileExists() {
    await this.updateToken();
    return firstValueFrom(this.http.get(this.apiUrl + '/userprofile/', this.httpOptions));
  }

  async createProfile() {
    await this.updateToken();
    return firstValueFrom(this.http.post(this.apiUrl + '/userprofile/', null, this.httpOptions));
  }

  async deleteProfile() {
    await this.updateToken();
    return firstValueFrom(this.http.delete(this.apiUrl + '/userprofile/', this.httpOptions));
  }

   async hideProfile() {
     await this.updateToken();
     return firstValueFrom(this.http.get(this.apiUrl + '/settings/hideprofile', this.httpOptions));
  }

  /*
   * Keycloak account is created after succesful Suomi.fi authentication.
   * Delete this account if user cancels service deployment.
   */
  async deleteAccount() {
    await this.updateToken({ bypassOrcidCheck: true });
    return firstValueFrom(this.http.delete(this.apiUrl + '/accountdelete/', this.httpOptions));
  }

  async getOrcidData() {
    await this.updateToken();
    return firstValueFrom(this.http.get(this.apiUrl + '/orcid/', this.httpOptions));
  }

  async getProfileData(): Promise<any> {
    await this.updateToken();
    let profile = await firstValueFrom(this.http
      .get<Profile[]>(this.apiUrl + '/profiledata/', this.httpOptions));
    return new Promise<any>(resolve => {
      resolve(this.profileAdapter.adapt(profile));
    });
  }

  // Draft profile is stored in session storage
  getDraftProfile() {
    if (this.appSettingsService.isBrowser) {
      return sessionStorage.getItem(Constants.draftProfile);
    }
  }

  async patchObjects(items) {
    await this.updateToken();
    let body = { groups: [], items: items };
    return firstValueFrom(this.http.patch(this.apiUrl + '/profiledata/', body, this.httpOptions));
  }

  async patchProfileDataSingleGroup(group) {
    await this.updateToken();
    let body = { groups: group, items: [] };
    return firstValueFrom(this.http.patch(this.apiUrl + '/profiledata/', body, this.httpOptions));
  }

  async patchProfileDataSingleItem(item) {
    await this.updateToken();
    let body = { groups: [], items: item };
    return firstValueFrom(this.http.patch(this.apiUrl + '/profiledata/', body, this.httpOptions));
  }

  /*
   * Trigger ORCID attribute handling in Keycloak.
   * Keycloak will add attribute 'orcid' into user's
   * access and id tokens.
   */
  async accountlink() {
    await this.updateToken({ bypassOrcidCheck: true });
    return firstValueFrom(this.http.get(this.apiUrl + '/accountlink/', this.httpOptions));
  }
}
