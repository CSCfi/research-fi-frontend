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

export interface Dataset {
  hits: any;
}

@Injectable({
  providedIn: 'root',
})
export class DatasetsService {
  apiUrl: string;
  profileApiUrl: string;
  httpOptions: object;

  datasetPayload = [];
  confirmedPayload = [];
  deletables = [];

  private confirmedPayloadSource = new BehaviorSubject<any>([]);
  currentDatasetPayload = this.confirmedPayloadSource.asObservable();

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

  addToPayload(datasets: any) {
    this.datasetPayload = this.datasetPayload.concat(datasets);
  }

  clearPayload() {
    this.datasetPayload = [];
  }

  confirmPayload() {
    const merged = this.confirmedPayload.concat(this.datasetPayload);
    this.confirmedPayload = merged;
    this.confirmedPayloadSource.next(merged);
  }

  cancelConfirmedPayload() {
    this.clearPayload();
    this.clearDeletables();
    this.confirmedPayload = [];
    this.confirmedPayloadSource.next([]);
  }

  removeFromConfirmed(id: string) {
    const filtered = this.confirmedPayload.filter((item) => item.id !== id);

    this.confirmedPayload = filtered;
    this.confirmedPayloadSource.next(filtered);
  }

  addToDeletables(dataset) {
    this.deletables.push(dataset);
  }

  clearDeletables() {
    this.deletables = [];
  }

  addDatasets() {
    this.updateTokenInHttpAuthHeader();
    const body = this.datasetPayload.map((item) => ({
      localIdentifier: item.id,
      show: item.itemMeta.show,
      primaryValue: item.itemMeta.primaryValue,
    }));
    return this.http.post(
      this.profileApiUrl + '/researchdataset/',
      body,
      this.httpOptions
    );
  }

  removeItems(datasets) {
    this.updateTokenInHttpAuthHeader();
    const body = datasets.map((dataset) => dataset.id);
    return this.http.post(
      this.profileApiUrl + '/researchdataset/remove/',
      body,
      this.httpOptions
    );
  }
}
