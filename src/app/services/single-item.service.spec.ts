//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SingleItemService } from './single-item.service';
import { SettingsService } from './settings.service';
import { AppConfigService } from './app-config-service.service';

import ResponseJsonPublications from '../../testdata/searchresponse-publications.json';

const mockApiUrl = 'test.api.fi/';

export class AppConfigServiceMock {
  get apiUrl() {
      return mockApiUrl;
  }
}

describe('SingleItemService', () => {
  let service: SingleItemService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        SingleItemService,
        SettingsService,
        { provide: AppConfigService, useClass: AppConfigServiceMock}
      ]
    });
    service = TestBed.inject(SingleItemService);
  });

  it('should be created', () => {
    expect(SingleItemService).toBeTruthy();
  });

  it('should send API request to publication/_search from single publication', () => {
    const searchResponseMock = ResponseJsonPublications;
    const http = TestBed.inject(HttpTestingController);
    TestBed.inject(SettingsService);

    const queryUrl = mockApiUrl + 'publication/_search';
    let searchResponse;

    service.getSinglePublication('0367228520').subscribe((response) => {
      searchResponse = response;
    });

    http.expectOne({
      url: mockApiUrl + 'publication/_search',
      method: 'POST'
    }).flush(searchResponseMock);
  });
});
