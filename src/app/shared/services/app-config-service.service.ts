//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
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

  portalSettings = {
    label: $localize`:@@appSlogan:Tiedejatutkimus.fi`,
    baseRoute: '',
    navItems: [
      { label: $localize`:@@headerLink1:Etusivu`, link: '/', exact: true },
      {
        label: $localize`:@@headerLink2:Haku`,
        link: '/results/',
        exact: false,
      },
      {
        label: $localize`:@@headerLink3:Tiede- ja innovaatiopolitiikka`,
        link: '/science-innovation-policy/',
        dropdownItems: [
          {
            label: $localize`:@@headerLink4:Tutkimus- ja innovaatiojärjestelmä`,
            link: '/science-innovation-policy/research-innovation-system/',
            exact: true,
          },
          {
            label: $localize`:@@headerLink5:Tiede ja tutkimus lukuina`,
            link: '/science-innovation-policy/science-research-figures/',
            exact: true,
          },
        ],
      },
      {
        label: $localize`:@@headerLink6:Tiede- ja tutkimusuutiset`,
        link: '/news',
        exact: true,
      },
    ],
    localizedDomains: [
      { label: 'Suomi', locale: 'FI', url: 'https://tiedejatutkimus.fi/fi' },
      { label: 'Svenska', locale: 'SV', url: 'https://forskning.fi/sv' },
      { label: 'English', locale: 'EN', url: 'https://research.fi/en' },
    ],
  };

  myDataSettings = {
    label: 'Tutkijan tiedot',
    baseRoute: 'mydata',
    navItems: [{ label: 'Kirjaudu sisään', link: '', function: true }],
    localizedDomains: [
      { label: 'Suomi', locale: 'FI', url: 'https://localhost:5003/fi' },
      { label: 'Svenska', locale: 'SV', url: 'https://localhost:5003/sv' },
      { label: 'English', locale: 'EN', url: 'https://localhost:5003/en' },
    ],
  };

  constructor(private http: HttpClient) {}

  // Read configuartion file
  loadAppConfig() {
    return this.http
      .get('assets/config/config.json')
      .toPromise()
      .then((data) => {
        this.appConfig = data;
      });
  }

  // API Url
  get apiUrl() {
    if (!this.appConfig) {
      throw Error('Config file not loaded!');
    }
    return this.appConfig.apiUrl + '/portalapi/';
  }

  // CMS Url
  get cmsUrl() {
    if (!this.appConfig) {
      throw Error('Config file not loaded!');
    }
    return this.appConfig.cmsUrl;
  }

  // Application performance monitoring Url
  get apmUrl() {
    if (!this.appConfig) {
      throw Error('Config file not loaded!');
    }
    return this.appConfig.apiUrl + '/apm/';
  }

  // Build info
  get buildInfo() {
    if (!this.appConfig) {
      throw Error('Config file not loaded!');
    }
    return this.appConfig.buildInfo;
  }

  // Environment name
  get environmentName() {
    if (!this.appConfig) {
      throw Error('Config file not loaded!');
    }
    return this.appConfig.environmentName;
  }

  /*
   *  MyData configurations
   */

  // Auth config
  get myDataAuthConfig() {
    if (!this.appConfig) {
      throw Error('Config file not loaded!');
    }
    return this.appConfig.myData.authConfig;
  }

  // API Url
  get myDataApiUrl() {
    if (!this.appConfig) {
      throw Error('Config file not loaded!');
    }
    return this.appConfig.myData.apiUrl;
  }
}
