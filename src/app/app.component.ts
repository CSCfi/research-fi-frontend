//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Inject, OnInit } from '@angular/core';
import { AppConfigService } from './services/app-config-service.service';
import 'reflect-metadata'; // Required by ApmService
import { ApmService } from '@elastic/apm-rum-angular';
import {
  Router,
  RouterEvent,
  NavigationStart,
  NavigationEnd,
} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'research-fi-portal';
  loading: boolean;

  /*
  Application performance monitoring (APM) service must be initialized on component init.
  Values for APM Configuration parameters 'serverUrl' and 'environment' are taken from AppConfigService.
  https://www.elastic.co/guide/en/apm/agent/rum-js/current/configuration.html
  */
  constructor(
    @Inject(ApmService) service: ApmService,
    private appConfigService: AppConfigService,
    private router: Router
  ) {
    const apm = service.init({
      serviceName: 'Angular',
      serverUrl: this.appConfigService.apmUrl,
      environment: this.appConfigService.environmentName,
      eventsLimit: 10,
      transactionSampleRate: 0.1,
      disableInstrumentations: [
        // 'page-load',
        'history',
        'eventtarget',
        'xmlhttprequest',
        'fetch',
        // 'error'
      ],
    });
  }

  ngOnInit() {
    this.routerEvents();
  }

  // Set loading indicator. This is useful for pages that rely on resolvers
  routerEvents() {
    this.router.events.subscribe((event: RouterEvent) => {
      switch (true) {
        case event instanceof NavigationStart: {
          this.loading = true;
          break;
        }
        case event instanceof NavigationEnd: {
          this.loading = false;
          break;
        }
      }
    });
  }
}
