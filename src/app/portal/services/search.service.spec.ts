//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { TestBed } from '@angular/core/testing';
import { FilterService } from './filters/filter.service';
import { SortService } from './sort.service';
import { TabChangeService } from './tab-change.service';
import { SearchService } from './search.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppConfigService } from '@shared/services/app-config-service.service';

import ResponseJsonPublications from 'src/testdata/searchresponse-publications.json';
import ResponseJsonFundings from 'src/testdata/searchresponse-fundings.json';
import ResponseJsonInfrastructures from 'src/testdata/searchresponse-infrastructures.json';
import { MatDialogModule } from '@angular/material/dialog';

const mockApiUrl = 'test.api.fi/';

export class AppConfigServiceMock {
  get apiUrl() {
    return mockApiUrl;
  }
}

describe('SearchService', () => {
  let searchService: SearchService;
  let httpController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule, MatDialogModule],
      providers: [
        SearchService,
        FilterService,
        SortService,
        TabChangeService,
        { provide: AppConfigService, useClass: AppConfigServiceMock },
      ],
    });

    searchService = TestBed.inject(SearchService);
    httpController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(searchService).toBeTruthy();
  });

  const testTotal = () => {
    searchService.getData().subscribe((response) => {
      expect(response.total).toBeGreaterThan(0)
    });
  }

  it('should send API request to publication/_search from publications tab', () => {
    const searchResponseMock = ResponseJsonPublications;
    const tabChangeService = TestBed.inject(TabChangeService);
    const sortService = TestBed.inject(SortService);

    searchService.searchTerm = 'searchtext';
    searchService.fromPage = 1;
    tabChangeService.tab = 'publications';
    sortService.sort = [];

    testTotal()

    httpController
      .expectOne({
        url: mockApiUrl + 'publication/_search?',
        method: 'POST',
      })
      .flush(searchResponseMock);
  });

  it('should send API request to funding/_search from fundings tab', () => {
    const searchResponseMock = ResponseJsonFundings;
    const tabChangeService = TestBed.inject(TabChangeService);
    const sortService = TestBed.inject(SortService);

    searchService.searchTerm = 'searchtext';
    searchService.fromPage = 1;
    tabChangeService.tab = 'fundings';
    sortService.sort = [];

    testTotal()

    httpController
      .expectOne({
        url: mockApiUrl + 'funding/_search?',
        method: 'POST',
      })
      .flush(searchResponseMock);
  });

  it('should send API request to infrastructure/_search from infrastructures tab', () => {
    const searchResponseMock = ResponseJsonInfrastructures;
    const tabChangeService = TestBed.inject(TabChangeService);
    const sortService = TestBed.inject(SortService);

    searchService.searchTerm = 'searchtext';
    searchService.fromPage = 1;
    tabChangeService.tab = 'infrastructures';
    sortService.sort = [];

    testTotal()

    httpController
      .expectOne({
        url: mockApiUrl + 'infrastructure/_search?',
        method: 'POST',
      })
      .flush(searchResponseMock);
  });
});
