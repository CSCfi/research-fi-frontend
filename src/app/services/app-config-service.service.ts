//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  private appConfig: any;

  constructor(private http: HttpClient) { }

  loadAppConfig() {
    return this.http.get('/assets/config.json')
      .toPromise()
      .then(data => {
        this.appConfig = data;
      });
  }

  // Configuration
  get apiUrl() {

    if (!this.appConfig) {
      throw Error('Config file not loaded!');
    }

    // Api url
    return this.appConfig.apiUrl;
  }
}
