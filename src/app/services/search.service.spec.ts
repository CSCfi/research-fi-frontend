//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { TestBed } from '@angular/core/testing';
import { FilterService } from './filter.service';
import { SortService } from './sort.service';
import { TabChangeService } from './tab-change.service';
import { SearchService } from './search.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { AppConfigService } from './app-config-service.service';

import ResponseJsonPublications from '../../testdata/searchresponse-publications.json';
import ResponseJsonFundings from '../../testdata/searchresponse-fundings.json';
import ResponseJsonInfrastructures from '../../testdata/searchresponse-infrastructures.json';

const mockApiUrl = 'test.api.fi/'

export class AppConfigServiceMock {
  get apiUrl() {
      return mockApiUrl;
  }
}

describe('SearchService', () => {
  let searchService: SearchService;

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        SearchService,
        FilterService,
        SortService,
        TabChangeService,
        { provide: AppConfigService, useClass: AppConfigServiceMock}
      ]
    });

    searchService = TestBed.get(SearchService);
  });

  it('should be created', () => {
    expect(searchService).toBeTruthy();
  });

  it('should send API request to publication/_search from publications tab', () => {
    const searchResponseMock = ResponseJsonPublications;
    const http = TestBed.get(HttpTestingController);
    const tabChangeService = TestBed.get(TabChangeService);
    let searchResponse;

    searchService.searchTerm = 'searchtext';
    searchService.fromPage = 1;
    tabChangeService.tab = 'publications';

    searchService.getData().subscribe((response) => {
      searchResponse = response;
    });

    http.expectOne({
      url: mockApiUrl + 'publication/_search?',
      method: 'POST'
    }).flush(searchResponseMock);
  });

  it('should send API request to funding/_search from fundings tab', () => {
    const searchResponseMock = ResponseJsonFundings;
    const http = TestBed.get(HttpTestingController);
    const tabChangeService = TestBed.get(TabChangeService);
    let searchResponse;

    searchService.searchTerm = 'searchtext';
    searchService.fromPage = 1;
    tabChangeService.tab = 'fundings';

    searchService.getData().subscribe((response) => {
      searchResponse = response;
    });

    http.expectOne({
      url: mockApiUrl + 'funding/_search?',
      method: 'POST'
    }).flush(searchResponseMock);
  });

  it('should send API request to infrastructure/_search from infrastructures tab', () => {
    const searchResponseMock = ResponseJsonInfrastructures;
    const http = TestBed.get(HttpTestingController);
    const tabChangeService = TestBed.get(TabChangeService);
    let searchResponse;

    searchService.searchTerm = 'searchtext';
    searchService.fromPage = 1;
    tabChangeService.tab = 'infrastructures';

    searchService.getData().subscribe((response) => {
      searchResponse = response;
    });

    http.expectOne({
      url: mockApiUrl + 'infrastructure/_search?',
      method: 'POST'
    }).flush(searchResponseMock);
  });
});