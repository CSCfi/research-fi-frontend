//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfigService } from 'src/app/shared/services/app-config-service.service';
import { SettingsService } from './settings.service';

@Injectable()
export class AutosuggestService {
  apiUrl: any;

  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService,
    private settingService: SettingsService
  ) {
    this.apiUrl = this.appConfigService.apiUrl;
  }

  search(term: string) {
    const payLoad = this.settingService.autoSuggestSettings(term);
    return this.http.post(this.apiUrl + this.settingService.indexList, payLoad);
  }
}
