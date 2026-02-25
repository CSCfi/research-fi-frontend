import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConfigService } from '@shared/services/app-config-service.service';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OwsSearchService {
  apiUrl: string;
  httpOptions: any;
  searchRequestBody: any;

  requestBodyStub = {
    "descriptions": [],
    "identifiers": [],
    "titles": [],
    "result_page": 1
  };

  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService,
    public oidcSecurityService: OidcSecurityService
  ) {
    this.apiUrl = this.appConfigService.apiUrl;
    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };
  }

  formatRequestBody(dataSource: string, inputData): string {
    if (dataSource === 'fundings'){
      this.requestBodyStub.descriptions = [...inputData[0].owsDescriptions];
      this.requestBodyStub.titles = [...inputData[0].owsTitles];

      return JSON.stringify(this.requestBodyStub);
    } else if (dataSource === 'dataset'){
      this.requestBodyStub.descriptions = [...inputData[0].owsDescriptions];
      this.requestBodyStub.titles = [...inputData[0].owsTitles];

      return JSON.stringify(this.requestBodyStub);
    }
    else {
      return undefined;
    }
  }

  public async postOwsSearchRequest(dataSource: string, inputData: any): Promise<any> {
    if (dataSource && inputData) {
      return lastValueFrom(this.http.post(this.apiUrl.substring(0, this.apiUrl.length - 11) + '/ows/', this.formatRequestBody(dataSource, inputData), this.httpOptions)).then(result => {
        return result;
      });
    }
/*    else {
      return new Promise((resolve, reject) => {
        resolve(this.mockResponse);
      });
    }*/
  }

}
