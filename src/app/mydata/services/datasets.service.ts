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
import { map, switchMap } from "rxjs/operators"

export interface Dataset {
  hits: any;
}

@Injectable({
  providedIn: 'root',
})
export class DatasetsService {
  apiUrl: string;
  profileApiUrl: string;

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

  tokenToHttpOptions(token: string) {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }),
    };
  }

  addToPayload(datasets: any) {
    this.datasetPayload = this.datasetPayload.concat(datasets);
  }

  clearPayload() {
    this.datasetPayload = [];
  }

  confirmPayload() {
    // Remove entry if user adds an item from portal search and unchecks it in editor table afterwards
    this.datasetPayload.forEach((item) => {
      if (
        this.confirmedPayload.find(
          (confirmedItem) => confirmedItem.id === item.id
        )
      ) {
        this.confirmedPayload = this.confirmedPayload.filter(
          (confirmedItem) => confirmedItem.id !== item.id
        );
        this.datasetPayload = this.datasetPayload.filter(
          (payloadItem) => payloadItem.id !== item.id
        );
      }
    });
    const merged = this.confirmedPayload.concat(this.datasetPayload);
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

  removeFromConfirmed(id: string) {
    const filtered = this.confirmedPayload.filter((item) => item.id !== id);

    this.confirmedPayload = filtered;
    this.confirmedPayloadSource.next(filtered);
  }

  addToDeletables(dataset) {
    this.datasetPayload = this.datasetPayload.filter(
      (item) => item.id !== dataset.id
    );

    this.deletables.push(dataset);
  }

  clearDeletables() {
    this.deletables = [];
  }

  addDatasets() {
    return this.oidcSecurityService.getAccessToken().pipe(map(this.tokenToHttpOptions), switchMap((options) => {
      const body = this.confirmedPayload.map((item) => ({
        localIdentifier: item.id,
        show: item.itemMeta.show,
        primaryValue: item.itemMeta.primaryValue,
      }));

      return this.http.post(this.profileApiUrl + '/researchdataset/', body, options);
    }));
  }

  removeItems(datasets) {
    return this.oidcSecurityService.getAccessToken().pipe(map(this.tokenToHttpOptions), switchMap((options) => {
      const body = datasets.map((dataset) => dataset.id);
      return this.http.post(this.profileApiUrl + '/researchdataset/remove/', body, options);
    }));
  }
}
