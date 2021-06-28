//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

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

  // Module related settings
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
        label: $localize`:@@headerLink7:Rahoitushaut`,
        link: '/funding-calls',
        queryParams: {status: 'open'},
        exact: false,
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
    develop: true,
    beta: true,
    label: 'Tutkijan tiedot',
    baseRoute: 'mydata',
    navItems: [{ label: 'Kirjaudu sisään', link: '', loginProcess: true }],
    localizedDomains: [
      { label: 'Suomi', locale: 'FI', url: 'https://localhost:5003/fi' },
      { label: 'Svenska', locale: 'SV', url: 'https://localhost:5003/sv' },
      { label: 'English', locale: 'EN', url: 'https://localhost:5003/en' },
    ],
  };

  constructor() {}

  updateMobileStatus(status) {
    this.mobileSource.next(status);
  }
}
