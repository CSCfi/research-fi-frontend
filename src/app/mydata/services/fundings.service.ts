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

@Injectable({
  providedIn: 'root',
})
export class FundingsService {
  apiUrl: string;
  profileApiUrl: string;
  httpOptions: object;

  fundingPayload = [];
  confirmedPayload = [];
  deletables = [];

  private confirmedPayloadSource = new BehaviorSubject<any>([]);
  currentFundingPayload = this.confirmedPayloadSource.asObservable();

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

  addToPayload(fundings: any) {
    this.fundingPayload = this.fundingPayload.concat(fundings);
  }

  clearPayload() {
    this.fundingPayload = [];
  }

  confirmPayload() {
    const merged = this.confirmedPayload.concat(this.fundingPayload);
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

  addToDeletables(funding) {
    this.fundingPayload = this.fundingPayload.filter(
      (item) => item.id !== funding.id
    );

    this.deletables.push(funding);
  }

  clearDeletables() {
    this.deletables = [];
  }

  addFundings() {
    this.updateTokenInHttpAuthHeader();

    const body = this.fundingPayload.map((item) => ({
      projectId: item.id,
      show: item.itemMeta.show,
      primaryValue: item.itemMeta.primaryValue,
    }));

    return this.http.post(
      this.profileApiUrl + '/fundingdecision/',
      body,
      this.httpOptions
    );
  }

  removeItems(fundings) {
    this.updateTokenInHttpAuthHeader();
    const body = fundings.map((funding) => funding.id);
    return this.http.post(
      this.profileApiUrl + '/fundingdecision/remove/',
      body,
      this.httpOptions
    );
  }
}
