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

  // testData = [
  //   {
  //     id: 1,
  //     fieldIdentifier: 101,
  //     show: true,
  //     name: 'Sauli Purhonen',
  //     webLink: null,
  //     sourceId: null,
  //     label: 'Nimi',
  //   },
  //   {
  //     label: 'Linkit',
  //     show: true,
  //     items: [
  //       {
  //         id: 3,
  //         fieldIdentifier: 110,
  //         show: false,
  //         name: null,
  //         webLink: { url: 'https://tiedejatutkimus.fi/fi/', urlLabel: 'TTV' },
  //         sourceId: null,
  //       },
  //       {
  //         id: 4,
  //         fieldIdentifier: 110,
  //         show: false,
  //         name: null,
  //         webLink: { url: 'https://forskning.fi/sv/', urlLabel: 'Forskning' },
  //         sourceId: null,
  //       },
  //     ],
  //   },
  // ];

  testData = [
    {
      dataSource: { id: 1, name: 'ORCID' },
      items: [{ value: 'Sauli', itemMeta: { id: 6, type: 102, show: false } }],
      groupMeta: { id: 21, type: 102, show: true },
      label: 'Etunimi',
    },
    {
      dataSource: { id: 1, name: 'ORCID' },
      items: [
        { value: 'Purhonen', itemMeta: { id: 6, type: 101, show: false } },
      ],
      groupMeta: { id: 22, type: 101, show: true },
      label: 'Sukunimi',
    },
    {
      dataSource: { id: 1, name: 'ORCID' },
      items: [
        { value: 'SM Purhonen', itemMeta: { id: 7, type: 103, show: false } },
      ],
      groupMeta: { id: 23, type: 103, show: true },
      label: 'Muut nimet',
    },
    {
      dataSource: { id: 1, name: 'ORCID' },
      items: [
        { value: 'Angular', itemMeta: { id: 7, type: 106, show: false } },
      ],
      groupMeta: { id: 27, type: 106, show: true },
      label: 'Avainsanat',
    },
    {
      dataSource: { id: 1, name: 'ORCID' },
      items: [
        {
          url: 'https://tiedejatutkimus.fi/fi/',
          linkLabel: 'TTV',
          itemMeta: { id: 7, type: 110, show: false },
        },
        {
          url: 'https://forskning.fi/sv/',
          linkLabel: 'Forskning',
          itemMeta: { id: 8, type: 110, show: false },
        },
      ],
      groupMeta: { id: 25, type: 110, show: true },
      label: 'Linkit',
    },
  ];

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
    let body = { groups: [group], items: [] };
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

  patchProfileData(modificationItem) {
    this.updateTokenInHttpAuthHeader();
    let body = modificationItem;
    return this.http.patch(
      this.apiUrl + '/profiledata/',
      body,
      this.httpOptions
    );
  }
}
