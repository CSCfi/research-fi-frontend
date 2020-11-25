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

/*
AppConfigService is used to load configuration when application is started.
It differs from using starndard environment files, which hard code values in application build.
This service allows configuration, such as API URL, to be changed after application build.
That feature is required in CI/CD systems, which build the application once and after that
use the same app version in testing and production deployment.

The service reads configuration from file: /assets/config/config.json

Add the file manually for local development. Do not include it into Git repository.
CI/CD pipeline adds the file automatically
*/
export class AppConfigService {
  private appConfig: any;

  constructor(private http: HttpClient) { }

  // Read configuartion file
  loadAppConfig() {
    return this.http.get('assets/config/config.json')
      .toPromise()
      .then(data => {
        this.appConfig = data;
      });
  }

  // API Url
  get apiUrl() {
    if (!this.appConfig) { throw Error('Config file not loaded!'); }
    return this.appConfig.apiUrl + '/portalapi/';
  }

  // Content data API url
  get contentApiUrl() {
    if (!this.appConfig) { throw Error('Config file not loaded!'); }
    return this.appConfig.contentApiUrl;
  }
  // Application performance monitoring Url
  get apmUrl() {
    if (!this.appConfig) { throw Error('Config file not loaded!'); }
    return this.appConfig.apiUrl + '/apm/';
  }

  // Build info
  get buildInfo() {
    if (!this.appConfig) { throw Error('Config file not loaded!'); }
    return this.appConfig.buildInfo;
  }

  // Environment name
  get environmentName() {
    if (!this.appConfig) { throw Error('Config file not loaded!'); }
    return this.appConfig.environmentName;
  }
}