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
        label: 'Nimi',
        groupItems: [
          {
            dataSource: { id: 1, name: 'ORCID' },
            items: [
              {
                firstNames: 'Sauli',
                lastName: 'Purhonen',
                fullName: '',
                itemMeta: {
                  id: 10,
                  type: 112,
                  show: true,
                  primaryValue: false,
                },
                value: 'Sauli Purhonen',
              },
            ],
            groupMeta: { id: 29, type: 110, show: true },
          },
          {
            dataSource: { id: 2, name: 'Yliopisto A' },
            items: [
              {
                firstNames: 'Tuisku',
                lastName: 'Tutkija',
                fullName: '',
                itemMeta: {
                  id: 6,
                  type: 112,
                  show: false,
                  primaryValue: false,
                },
                value: 'Tuisku Tutkija',
              },
            ],
            groupMeta: { id: 44, type: 110, show: false },
          },
          {
            dataSource: { id: 3, name: 'Tutkimuslaitos X' },
            items: [
              {
                firstNames: 'Ami',
                lastName: 'Asiantuntija',
                fullName: '',
                itemMeta: {
                  id: 5,
                  type: 112,
                  show: false,
                  primaryValue: false,
                },
                value: 'Ami Asiantuntija',
              },
            ],
            groupMeta: { id: 56, type: 110, show: false },
          },
        ],
        disabled: true,
        single: true,
      },
      {
        label: 'Muut nimet',
        groupItems: [
          {
            dataSource: { id: 1, name: 'ORCID' },
            items: [
              {
                firstNames: '',
                lastName: '',
                fullName: 'SM Purhonen',
                itemMeta: {
                  id: 11,
                  type: 120,
                  show: false,
                  primaryValue: false,
                },
                value: 'SM Purhonen',
              },
            ],
            groupMeta: { id: 30, type: 120, show: false },
          },
          {
            dataSource: { id: 2, name: 'Yliopisto A' },
            items: [
              {
                firstNames: '',
                lastName: '',
                fullName: 'T.A. Tutkija',
                itemMeta: {
                  id: 8,
                  type: 120,
                  show: false,
                  primaryValue: false,
                },
                value: 'T.A. Tutkija',
              },
              {
                firstNames: '',
                lastName: '',
                fullName: 'T. Tutkija',
                itemMeta: {
                  id: 9,
                  type: 120,
                  show: false,
                  primaryValue: false,
                },
                value: 'T. Tutkija',
              },
            ],
            groupMeta: { id: 43, type: 120, show: false },
          },
          {
            dataSource: { id: 3, name: 'Tutkimuslaitos X' },
            items: [
              {
                firstNames: '',
                lastName: '',
                fullName: 'Tuisku Tutkija',
                itemMeta: {
                  id: 7,
                  type: 120,
                  show: false,
                  primaryValue: false,
                },
                value: 'Tuisku Tutkija',
              },
            ],
            groupMeta: { id: 55, type: 120, show: false },
          },
        ],
      },
      {
        label: 'Sähköposti',
        groupItems: [
          {
            dataSource: { id: 2, name: 'Yliopisto A' },
            items: [
              {
                value: 'tuisku.tutkija@yliopisto.fi',
                itemMeta: {
                  id: 3,
                  type: 171,
                  show: false,
                  primaryValue: false,
                },
              },
            ],
            groupMeta: { id: 48, type: 171, show: false },
          },
          {
            dataSource: { id: 3, name: 'Tutkimuslaitos X' },
            items: [
              {
                value: 'ami.asiantuntija@tutkimuslaitos.fi',
                itemMeta: {
                  id: 2,
                  type: 171,
                  show: false,
                  primaryValue: false,
                },
              },
            ],
            groupMeta: { id: 60, type: 171, show: false },
          },
        ],
      },
      {
        label: 'Kuvaus',
        groupItems: [
          {
            dataSource: { id: 2, name: 'Yliopisto A' },
            items: [
              {
                researchDescriptionFi:
                  'Tutkimuksen kuvausta suomeksi. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
                researchDescriptionEn:
                  'Description of my research in English. Duis ullamcorper sem in sapien pretium bibendum. Vestibulum ex dui, volutpat commodo condimentum sed, lobortis at justo.',
                researchDescriptionSv:
                  'Beskrivning av forskningen på svenska. Fusce in lorem tempor, feugiat nunc ut, consectetur erat. Integer purus sem, hendrerit at bibendum vel, laoreet nec tellus.',
                itemMeta: {
                  id: 3,
                  type: 140,
                  show: false,
                  primaryValue: false,
                },
              },
            ],
            groupMeta: { id: 42, type: 140, show: false },
          },
          {
            dataSource: { id: 3, name: 'Tutkimuslaitos X' },
            items: [
              {
                researchDescriptionFi:
                  'Tutkimuksen kuvausta suomeksi. Duis finibus velit rutrum euismod scelerisque. Praesent sit amet fermentum ex. Donec vitae tellus eu nisl dignissim laoreet.',
                researchDescriptionEn: null,
                researchDescriptionSv: null,
                itemMeta: {
                  id: 2,
                  type: 140,
                  show: false,
                  primaryValue: false,
                },
              },
            ],
            groupMeta: { id: 54, type: 140, show: false },
          },
        ],
      },
      {
        label: 'Linkit',
        groupItems: [
          {
            dataSource: { id: 1, name: 'ORCID' },
            items: [
              {
                url: 'https://tiedejatutkimus.fi/fi/',
                linkLabel: 'TTV',
                itemMeta: {
                  id: 5,
                  type: 180,
                  show: false,
                  primaryValue: false,
                },
              },
              {
                url: 'https://forskning.fi/sv/',
                linkLabel: 'Forskning',
                itemMeta: {
                  id: 6,
                  type: 180,
                  show: false,
                  primaryValue: false,
                },
              },
            ],
            groupMeta: { id: 33, type: 180, show: false },
          },
        ],
      },
    ],
    description: [
      {
        label: 'Avainsanat',
        groupItems: [
          {
            dataSource: { id: 1, name: 'ORCID' },
            items: [
              {
                value: 'Angular',
                itemMeta: {
                  id: 15,
                  type: 150,
                  show: false,
                  primaryValue: false,
                },
              },
              {
                value: 'TTV',
                itemMeta: {
                  id: 16,
                  type: 150,
                  show: false,
                  primaryValue: false,
                },
              },
            ],
            groupMeta: { id: 28, type: 150, show: false },
          },
          {
            dataSource: { id: 2, name: 'Yliopisto A' },
            items: [
              {
                value: 'Suomen historia',
                itemMeta: {
                  id: 11,
                  type: 150,
                  show: false,
                  primaryValue: false,
                },
              },
              {
                value: 'sisätaudit',
                itemMeta: {
                  id: 12,
                  type: 150,
                  show: false,
                  primaryValue: false,
                },
              },
              {
                value: 'aerosolit',
                itemMeta: {
                  id: 13,
                  type: 150,
                  show: false,
                  primaryValue: false,
                },
              },
              {
                value: 'digitalisaatio',
                itemMeta: {
                  id: 14,
                  type: 150,
                  show: false,
                  primaryValue: false,
                },
              },
            ],
            groupMeta: { id: 45, type: 150, show: false },
          },
          {
            dataSource: { id: 3, name: 'Tutkimuslaitos X' },
            items: [
              {
                value: 'history of Finland',
                itemMeta: {
                  id: 7,
                  type: 150,
                  show: false,
                  primaryValue: false,
                },
              },
              {
                value: 'internal medicine',
                itemMeta: {
                  id: 8,
                  type: 150,
                  show: false,
                  primaryValue: false,
                },
              },
              {
                value: 'aerosols',
                itemMeta: {
                  id: 9,
                  type: 150,
                  show: false,
                  primaryValue: false,
                },
              },
              {
                value: 'digitalization',
                itemMeta: {
                  id: 10,
                  type: 150,
                  show: false,
                  primaryValue: false,
                },
              },
            ],
            groupMeta: { id: 57, type: 150, show: false },
          },
        ],
      },
    ],
    education: [{ label: 'Koulutus', groupItems: [] }],
    publication: [{ label: 'Julkaisut', groupItems: [] }],
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
