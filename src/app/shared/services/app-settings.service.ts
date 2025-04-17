//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT
import { Inject, Injectable, LOCALE_ID, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})

/*
  App is separated in two main modules. One for Portal and one for MyData.
  These basically work as different apps but share notable amount of components and data
  and for this reason these apps are used as feature modules instead of separate projects.
*/
export class AppSettingsService {
  // Project wide settings
  private mobileSource = new BehaviorSubject(false);
  mobileStatus = this.mobileSource.asObservable();

  private appSettingsSource = new Subject<any>();
  appSettings = this.appSettingsSource.asObservable();

  defaultDomains = [
    { label: 'Suomeksi', locale: 'FI', url: 'https://tiedejatutkimus.fi/fi' },
    { label: 'På svenska', locale: 'SV', url: 'https://forskning.fi/sv' },
    { label: 'In English', locale: 'EN', url: 'https://research.fi/en' },
  ];

  // Module related settings
  portalSettings = {
    appName: 'portal',
    label: $localize`:@@appName:Tiedejatutkimus.fi`,
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
            label: $localize`:@@openScienceAndResearchIndicatorsHeader:Avoimen tieteen ja tutkimuksen seuranta`,
            link: '/science-innovation-policy/open-science-and-research-indicators/',
            exact: true,
          },
          {
            label: $localize`:@@headerLink4:Tutkimus- ja innovaatiojärjestelmä`,
            link: '/science-innovation-policy/research-innovation-system/',
            exact: true,
          },
          {
            label: $localize`:@@headerLink5:Lukuja tieteestä ja tutkimuksesta`,
            link: '/science-innovation-policy/science-research-figures/',
            exact: true,
          },
          {
            label: $localize`:@@externalLinksHeader:Tieteestä ja tutkimuksesta muualla`,
            link: '/science-innovation-policy/external-links/',
            exact: true,
          },
        ],
      },
      {
        label: $localize`:@@headerLink6:Tiede- ja tutkimusuutiset`,
        link: '/news',
        exact: true,
      },
      {
        label:$localize`:@@researchersProfileNew:Oma profiili`,
        link: '/mydata',
        exact: false,
},
    ],
    localizedDomains: this.defaultDomains,
  };

  myDataSettings = {
    debug: false, // !environment.production,
    beta: true,
    appName: 'myData',
    label: $localize`:@@researchersProfile:Tutkijan tiedot -työkalu`,
    baseRoute: 'mydata',
    navItems: [
      {
        label: $localize`:@@navigationHeaderProfile:Profiili`,
        link: '/mydata/profile',
      },
      {
        label: $localize`:@@dataAndSources:Tiedot ja tietolähteet`,
        link: '/mydata/data-sources',
      },
      {
        label: $localize`:@@accountSettings:Tiliasetukset`,
        link: '/mydata/account-settings',
      },
      {
        label: $localize`:@@logIn:Kirjaudu sisään`,
        link: '',
        loginProcess: true,
      },
    ],
    localizedDomains: this.defaultDomains,
    readMoreLinkFi: 'https://wiki.eduuni.fi/x/WQgGEw',
    readMoreLinkEn: 'https://wiki.eduuni.fi/x/jAGcEw',
    readMoreLinkSv: 'https://wiki.eduuni.fi/x/dAKcEw',
  };

  currentAppSettings: object;
  userOrcid: string; // Used in error monitoring

  currentLocale: string;
  capitalizedLocale: string;

  isBrowser: boolean;

  // Set in header by current route.
  // E.g. for use where we don't want to display new features in production.
  develop = false;

  constructor(
    @Inject(LOCALE_ID) protected localeId: string,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    // Locale
    this.currentLocale = this.localeId;
    this.capitalizedLocale =
      this.localeId.charAt(0).toUpperCase() + this.localeId.slice(1);

    // Browser check for SSR builds
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  updateMobileStatus(status) {
    this.mobileSource.next(status);
  }

  setCurrentAppSettings(app) {
    switch (app) {
      case 'myData': {
        this.currentAppSettings = this.myDataSettings;
        break;
      }
      default: {
        this.currentAppSettings = this.portalSettings;
      }
    }

    this.appSettingsSource.next(this.currentAppSettings);
  }

  setOrcid(id: string) {
    this.userOrcid = id;
  }
}
