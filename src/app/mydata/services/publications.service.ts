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
import { BehaviorSubject } from 'rxjs';

export interface Publication {
  hits: any;
}

@Injectable({
  providedIn: 'root',
})
export class PublicationsService {
  apiUrl: string;
  profileApiUrl: string;
  httpOptions: object;

  publicationPayload = [];
  confirmedPayload = [];
  deletables = [];

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
    const token = this.oidcSecurityService.getAccessToken();

    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }),
      observe: 'response',
    };
  }

  addToPayload(publications: any) {
    this.publicationPayload = this.publicationPayload.concat(publications);
  }

  clearPayload() {
    this.publicationPayload = [];
  }

  confirmPayload() {
    // Remove entry if user adds an item from portal search and unchecks it in editor table afterwards
    this.publicationPayload.forEach((item) => {
      if (
        this.confirmedPayload.find(
          (confirmedItem) => confirmedItem.id === item.id
        )
      ) {
        this.confirmedPayload = this.confirmedPayload.filter(
          (confirmedItem) => confirmedItem.id !== item.id
        );
        this.publicationPayload = this.publicationPayload.filter(
          (payloadItem) => payloadItem.id !== item.id
        );
      }
    });

    const merged = this.confirmedPayload.concat(this.publicationPayload);
    this.confirmedPayload = merged;
    this.confirmedPayloadSource.next(merged);
    this.clearPayload();
  }

  cancelConfirmedPayload() {
    this.clearPayload();
    this.clearDeletables();
    this.confirmedPayload = [];
    this.confirmedPayloadSource.next([]);
  }

  removeFromConfirmed(publicationId: string) {
    const filtered = this.confirmedPayload.filter(
      (item) => item.id !== publicationId
    );

    this.confirmedPayload = filtered;
    this.confirmedPayloadSource.next(filtered);
  }

  addToDeletables(publication) {
    this.publicationPayload = this.publicationPayload.filter(
      (item) => item.id !== publication.id
    );
    this.deletables.push(publication);
  }

  clearDeletables() {
    this.deletables = [];
  }

  addPublications() {
    this.updateTokenInHttpAuthHeader();
    const body = this.confirmedPayload.map((item) => ({
      publicationId: item.id,
      show: item.itemMeta.show,
      primaryValue: item.itemMeta.primaryValue,
    }));
    return this.http.post(
      this.profileApiUrl + '/publication/',
      body,
      this.httpOptions
    );
  }

  removeItems(publications) {
    this.updateTokenInHttpAuthHeader();
    const body = publications.map((publication) => publication.id);
    return this.http.post(
      this.profileApiUrl + '/publication/remove/',
      body,
      this.httpOptions
    );
  }
}
