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

  testData = {
    personal: [
      {
        dataSource: { id: 1, name: 'ORCID' },
        items: [
          {
            firstNames: 'Sauli',
            lastName: 'Purhonen',
            fullName: '',
            itemMeta: { id: 3, type: 112, show: false, primaryValue: false },
            value: 'Sauli Purhonen',
          },
        ],
        groupMeta: { id: 17, type: 110, show: true },
        label: 'Nimi',
        disabled: true,
        single: true,
      },
      {
        dataSource: { id: 1, name: 'ORCID' },
        items: [
          {
            firstNames: '',
            lastName: '',
            fullName: 'SM Purhonen',
            itemMeta: { id: 4, type: 120, show: false, primaryValue: false },
            value: 'SM Purhonen',
          },
        ],
        groupMeta: { id: 18, type: 120, show: false },
        label: 'Muut nimet',
      },
      {
        dataSource: { id: 1, name: 'ORCID' },
        items: [
          {
            url: 'https://tiedejatutkimus.fi/fi/',
            linkLabel: 'TTV',
            itemMeta: { id: 3, type: 180, show: true, primaryValue: false },
          },
          {
            url: 'https://forskning.fi/sv/',
            linkLabel: 'Forskning',
            itemMeta: { id: 4, type: 180, show: false, primaryValue: false },
          },
        ],
        groupMeta: { id: 21, type: 180, show: false },
        label: 'Linkit',
      },
    ],
    description: [
      {
        dataSource: { id: 1, name: 'ORCID' },
        items: [
          {
            value: 'Angular',
            itemMeta: { id: 5, type: 150, show: false, primaryValue: false },
          },
          {
            value: 'TTV',
            itemMeta: { id: 6, type: 150, show: false, primaryValue: false },
          },
        ],
        groupMeta: { id: 16, type: 150, show: false },
        label: 'Avainsanat',
      },
    ],
    education: [],
    publication: [],
  };
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
      .get<Orcid[]>(this.apiUrl + '/profiledata/', this.httpOptions)
      .pipe(map((data) => this.orcidAdapter.adapt(data)));
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
}
