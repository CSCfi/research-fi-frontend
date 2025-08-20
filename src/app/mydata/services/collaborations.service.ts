import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConfigService } from '@shared/services/app-config-service.service';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Constants } from '@mydata/constants';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CollaborationsService {
  apiUrl: string;

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

  tokenToHttpOptions(token: string) {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }),
    };
  }

  getCooperationChoices() {
    return this.oidcSecurityService.getAccessToken().pipe(map(this.tokenToHttpOptions), switchMap((options) => {
      return this.http.get(this.apiUrl + '/cooperationchoices/', options);
    }))
  }

  addToPayload(payload: any) {
    let temp = this.tempPayload;

    // Patch only unique items
    for (const option of payload) {
      const match = temp.find((tempOption) => tempOption.id === option.id);

      if (match) {
        const filterMatch = (arr) =>
          arr.filter((item) => item.id !== option.id);

        temp = filterMatch(temp);
        payload = filterMatch(payload);
      }
    }

    this.tempPayload = temp.concat(payload);

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

  patchCooperationChoices() {
    this.initialValue = this.confirmedPayload;

    return this.oidcSecurityService.getAccessToken().pipe(map(this.tokenToHttpOptions), switchMap((options) => {
      return this.http.patch(this.apiUrl + '/cooperationchoices/', this.confirmedPayload, options);
    }))
  }

  clearPayload() {
    this.tempPayload = [];
    this.confirmedPayload = [];
  }

  cancelConfirmedPayload() {
    this.clearPayload();
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
