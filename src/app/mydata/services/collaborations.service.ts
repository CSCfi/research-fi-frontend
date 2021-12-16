import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConfigService } from '@shared/services/app-config-service.service';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Constants } from '@mydata/constants';
import { differenceBy } from 'lodash-es';

@Injectable({
  providedIn: 'root',
})
export class CollaborationsService {
  apiUrl: string;
  httpOptions: object;

  initialValue = [];
  tempPayload = [];
  confirmedPayload = [];

  private confirmedPayloadSource = new BehaviorSubject<any>([]);
  currentCollaborationsPayload = this.confirmedPayloadSource.asObservable();

  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService,
    public oidcSecurityService: OidcSecurityService
  ) {
    this.apiUrl = this.appConfigService.profileApiUrl;
  }

  public hasInitialValue() {
    return this.confirmedPayload.length > 0;
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

  getCooperationChoices() {
    this.updateTokenInHttpAuthHeader();
    return this.http.get(
      this.apiUrl + '/CooperationChoices/',
      this.httpOptions
    );
  }

  addToPayload(payload: any) {
    this.tempPayload = payload;

    if (this.areInitialValuesChanged()) {
      this.confirmPayload();
    }
  }

  // This is set from summary card, if the value is not present
  setInitialValue(payload: any) {
    this.initialValue = payload;
  }

  private areInitialValuesChanged() {
    return (
      JSON.stringify(this.initialValue) !== JSON.stringify(this.tempPayload)
    );
  }

  patchCollaborationChoices() {
    this.initialValue = this.confirmedPayload;
    this.updateTokenInHttpAuthHeader();
    return this.http.patch(
      this.apiUrl + '/CooperationChoices/',
      this.confirmedPayload,
      this.httpOptions
    );
  }

  clearPayload() {
    this.tempPayload = [];
    this.confirmedPayload = [];
  }

  cancelConfirmedPayload() {
    this.clearPayload();
    this.confirmedPayload = [];
    this.confirmedPayloadSource.next([]);
  }

  confirmPayload() {
    this.confirmedPayload = this.tempPayload;
    this.confirmedPayloadSource.next(this.tempPayload);
    sessionStorage.setItem(
      Constants.draftCollaborationPatchPayload,
      JSON.stringify(this.tempPayload)
    );
  }
}
