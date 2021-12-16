import { Injectable } from '@angular/core';
import { BehaviorSubject } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { AppConfigService} from "@shared/services/app-config-service.service";
import { OidcSecurityService } from "angular-auth-oidc-client";
import { Constants } from "@mydata/constants";

@Injectable({
  providedIn: 'root'
})
export class CollaborationsService {
  apiUrl: string;
  httpOptions: object;

  initalValue = [];
  confirmedPayLoad = [];

  private confirmedPayloadSource = new BehaviorSubject<any>([]);
  currentCollaborationsPayload = this.confirmedPayloadSource.asObservable();

  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService,
    public oidcSecurityService: OidcSecurityService
  ) {
    // this.apiUrl = this.appConfigService.apiUrl;
    this.apiUrl = this.appConfigService.profileApiUrl;
  }

  public hasInitialValue() {
    console.log('length', this.confirmedPayLoad.length);
    return this.confirmedPayLoad.length > 0;
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
    return this.http.get(this.apiUrl + '/CooperationChoices/', this.httpOptions);
  }

  addToPayload(payload: any) {
    this.confirmedPayLoad = payload;
    console.log('initial values', this.initalValue);
    console.log('confirmedPayLoad', this.confirmedPayLoad);
    if (this.areInitialValuesChanged()) {
      console.log('confirm payload called from add function after diff');
      this.confirmPayload();
    }
  }

  // This is set from summary card, if the value is not present
  setInitialValue(payload: any) {
      this.initalValue = payload;
      console.log('initial values set to service', this.initalValue);
  }

  private areInitialValuesChanged() {
    if ((JSON.stringify(this.initalValue) !== JSON.stringify(this.confirmedPayLoad))) {
      console.log('values diff');
      return true;
    }
    console.log('values do not diff');
    return false;
  }

  patchCollaborationChoices() {
    this.updateTokenInHttpAuthHeader();
    return this.http.patch(
      this.apiUrl + '/CooperationChoices/',
      this.confirmedPayLoad,
      this.httpOptions
    );
  }

  clearPayload() {
    this.confirmedPayLoad = [];
  }

  cancelConfirmedPayload() {
    this.clearPayload();
    this.confirmedPayLoad = [];
    this.confirmedPayloadSource.next([]);
  }

  confirmPayload() {
    this.confirmedPayloadSource.next(this.confirmedPayLoad);
    sessionStorage.setItem(Constants.draftCollaborationPatchPayload, JSON.stringify(this.confirmedPayLoad));
  }
}
