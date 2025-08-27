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
import { ProfileAdapter } from '@mydata/models/profile.model';
import testData from 'src/testdata/mydataprofiledata.json';
import { BehaviorSubject, firstValueFrom, Subject } from 'rxjs';
import { ErrorHandlerService } from '@shared/services/error-handler.service';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { Constants } from '@mydata/constants';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  apiUrl: string;
  httpOptions: any;
  currentProfileData: any[];
  collaborationChoices: any[];
  settingsData: any[];

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

  private profileVisibilityInitialState$ = new BehaviorSubject(false);
  highlightOpennessInitialState$ = new BehaviorSubject(undefined);
  private automaticPublishingInitialState$ = new BehaviorSubject(false);

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

  getEditorProfileNameObservable() {
    return this.currentEditorProfileName;
  }

  setEditorProfileName(fullName: string) {
    this.editorProfileNameSource.next(fullName);
  }

  // Represents visible profile data and is used from draft data in updates or from back end in init phase
  setCurrentProfileData(data) {
    this.currentProfileData = data;
  }

  setCurrentCollaborationChoices(data){
    this.collaborationChoices = data;
  }

  setUserData(data: any) {
    this.userDataSource.next(data);
  }

  async checkProfileExists() {
    await this.updateToken();
    return await firstValueFrom(this.http.get(this.apiUrl + '/userprofile/', this.httpOptions));
  }

  async createProfile() {
    await this.updateToken();
    return await firstValueFrom(this.http.post(this.apiUrl + '/userprofile/', null, this.httpOptions));
  }

  async deleteProfile() {
    await this.updateToken();
    return await firstValueFrom(this.http.delete(this.apiUrl + '/userprofile/', this.httpOptions));
  }

  public async initializeProfileVisibilityAndSettings() {
    await this.updateToken();
    let value;

    try {
      value = await firstValueFrom(this.http.get(this.apiUrl + '/settings/', this.httpOptions));
    } catch (error) {
      console.error(error);
    }
    this.settingsData = value.data;
    this.profileVisibilityInitialState$.next(!value.data.hidden);
    this.highlightOpennessInitialState$.next(value.data.highlightOpeness);
    this.automaticPublishingInitialState$.next(value.data.publishNewData);

    return value;
  }

  public getProfileVisibilityObservable() {
    return this.profileVisibilityInitialState$.asObservable();
  }

  public getHighlightOpennessInitialState() {
    return this.highlightOpennessInitialState$.getValue();
  }

  public getAutomaticPublishingState() {
    return this.automaticPublishingInitialState$.getValue();
  }

  async hideProfile() {
    const body = { hidden: true };
    let value;

    try {
      await this.updateToken();
      value = await firstValueFrom(this.http.post(this.apiUrl + '/settings/', body, this.httpOptions));

      this.profileVisibilityInitialState$.next(false);
    } catch (error) {
      console.error(error);
    }
    return value;
  }

  async showProfile() {
    const body = { hidden: false };
    let value;

    try {
      await this.updateToken();
      value = await firstValueFrom(this.http.post(this.apiUrl + '/settings/', body, this.httpOptions));
      this.profileVisibilityInitialState$.next(true);
    } catch (error) {
      console.error(error);
    }
    return value
  }

  setHighlightOpennessState(value) {
    return this.oidcSecurityService.getAccessToken().pipe(map(this.tokenToHttpOptions), switchMap((options) => {
      const body = { highlightOpeness: value };
      return this.http.post(this.apiUrl + '/settings/', body, this.httpOptions)
    }));
  }

  logoutFromTool(){
    this.oidcSecurityService.logoff();
  }

  /*
   * Keycloak account is created after succesful Suomi.fi authentication.
   * Delete this account if user cancels service deployment.
   */
  async deleteAccount() {
    await this.updateToken({ bypassOrcidCheck: true });
    return await firstValueFrom(this.http.delete(this.apiUrl + '/accountdelete/', this.httpOptions));
  }

  async getOrcidData() {
    await this.updateToken();
    return await firstValueFrom(this.http.get(this.apiUrl + '/orcid/', this.httpOptions));
  }

  async fetchProfileDataFromBackend(): Promise<any> {
    await this.updateToken();
    const profile = await firstValueFrom(this.http.get(this.apiUrl + '/profiledata/', this.httpOptions));
    const resp= this.profileAdapter.adapt(profile);
    await this.fetchCollaborationOptionsFromBackend();
    return resp;
  }

  async fetchCollaborationOptionsFromBackend() {
    const cooperationChoices = await firstValueFrom(this.http.get(this.apiUrl + '/cooperationchoices/', this.httpOptions));
    this.setCurrentCollaborationChoices(cooperationChoices);
    return cooperationChoices;
  }

  tokenToHttpOptions(token: string) {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }),
    };
  }

  async patchSettingsData(data) {
    await this.updateToken();
    let body = { data: data };
    return await firstValueFrom(this.http.patch(this.apiUrl + '/settings/', body, this.httpOptions));
  }

  async patchObjects(items) {
    await this.updateToken();
    let body = { groups: [], items: items };
    return await firstValueFrom(this.http.patch(this.apiUrl + '/profiledata/', body, this.httpOptions));
  }

  async patchProfileDataSingleGroup(group) {
    await this.updateToken();
    let body = { groups: group, items: [] };
    return await firstValueFrom(this.http.patch(this.apiUrl + '/profiledata/', body, this.httpOptions));
  }

  async patchProfileDataSingleItem(item) {
    await this.updateToken();
    let body = { groups: [], items: item };
    return await firstValueFrom(this.http.patch(this.apiUrl + '/profiledata/', body, this.httpOptions));
  }

  /*
   * Trigger ORCID attribute handling in Keycloak.
   * Keycloak will add attribute 'orcid' into user's
   * access and id tokens.
   */
  async accountlink() {
    await this.updateToken({ bypassOrcidCheck: true });
    return await firstValueFrom(this.http.get(this.apiUrl + '/accountlink/', this.httpOptions));
  }
}
