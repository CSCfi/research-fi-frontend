//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Inject } from '@angular/core';
//import { ApmService } from '@elastic/apm-rum-angular';
//import { AppConfigService } from './services/app-config-service.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  title = 'research-fi-portal';

  /*
  Application performance monitoring (apm) service needs to be initialized on component init.
  APM Configuration parameters are taken from AppConfigService. 
  */
 /*
  constructor(@Inject(ApmService) service: ApmService, private appConfigService: AppConfigService) {
    // API is exposed through this apm instance
    console.log("apmUrl=", this.appConfigService.apmUrl);
    const apm = service.init({
      serviceName: 'Angular',
      serverUrl: this.appConfigService.apmUrl,
      environment: this.appConfigService.environmentName,
      disableInstrumentations: [
        //'page-load',
        'history',
        'eventtarget',
        'xmlhttprequest',
        'fetch',
        //'error'
      ]
    })
  }
  */
}