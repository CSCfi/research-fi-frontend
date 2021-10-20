//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConfigService } from '@shared/services/app-config-service.service';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

export interface Publication {
  hits: any;
}

@Injectable({
  providedIn: 'root',
})
export class PublicationsService {
  apiUrl: string;
  profileApiUrl: string;
  currentSort: any;
  pageSettings: any;
  httpOptions: object;

  publicationPayload = [];
  confirmedPayload = [];
  deletables = [];

  private termSource = new BehaviorSubject<string>('');
  currentTerm = this.termSource.asObservable();

  private confirmedPayloadSource = new BehaviorSubject<any>([]);
  currentPublicationPayload = this.confirmedPayloadSource.asObservable();

  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService,
    public oidcSecurityService: OidcSecurityService
  ) {
    // this.apiUrl = this.appConfigService.apiUrl;
    this.apiUrl =
      'https://researchfi-api-production-researchfi.rahtiapp.fi/portalapi/'; // Hardcoded production data url for dev purposes
    this.profileApiUrl = this.appConfigService.profileApiUrl;
  }

  updateTokenInHttpAuthHeader() {
    const token = this.oidcSecurityService.getToken();

    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }),
      observe: 'response',
    };
  }

  updateSort(sortSettings) {
    switch (sortSettings.active) {
      case 'year': {
        this.currentSort = {
          publicationYear: { order: sortSettings.direction },
        };
      }
    }
  }

  resetSort() {
    this.currentSort = {
      publicationYear: { order: 'desc' },
    };
  }

  updateSearchTerm(term: string) {
    this.termSource.next(term);
  }

  updatePageSettings(pageSettings) {
    this.pageSettings = pageSettings;
  }

  getPublications(term) {
    // Default sort to descending publicationYear
    const sort = this.currentSort
      ? this.currentSort
      : { publicationYear: { order: 'desc' } };

    const pageSettings = this.pageSettings;

    const query = {
      query_string: {
        query: term,
      },
    };

    let payload = {
      track_total_hits: true,
      sort: sort,
      from: pageSettings ? pageSettings.pageIndex * pageSettings.pageSize : 0,
      size: pageSettings ? pageSettings.pageSize : 10,
    };

    if (term?.length) payload = Object.assign(payload, { query: query });

    // TODO: Map response
    return this.http.post<Publication>(
      this.apiUrl + 'publication/_search?',
      payload
    );
  }

  addToPayload(publications: any) {
    this.publicationPayload = this.publicationPayload.concat(publications);
  }

  clearPayload() {
    this.publicationPayload = [];
  }

  confirmPayload() {
    const merged = this.confirmedPayload.concat(this.publicationPayload);
    this.confirmedPayload = merged;
    this.confirmedPayloadSource.next(merged);
  }

  cancelConfirmedPayload() {
    this.clearPayload();
    this.confirmedPayloadSource.next([]);
  }

  addToDeletables(publication: { publicationId: any }) {
    this.deletables.push(publication.publicationId);
  }

  clearDeletables() {
    this.deletables = [];
  }

  addPublications() {
    this.updateTokenInHttpAuthHeader();
    let body = this.publicationPayload.map((item) => ({
      publicationId: item.publicationId,
      show: item.itemMeta.show,
      primaryValue: item.itemMeta.primaryValue,
    }));
    return this.http.post(
      this.profileApiUrl + '/publication/',
      body,
      this.httpOptions
    );
  }

  deletePublication(publicationId) {
    this.updateTokenInHttpAuthHeader();
    return this.http.delete(
      this.profileApiUrl + '/publication/' + publicationId,
      this.httpOptions
    );
  }
}
