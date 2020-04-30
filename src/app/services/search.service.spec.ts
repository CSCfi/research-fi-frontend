import { TestBed } from '@angular/core/testing';
import { FilterService } from './filter.service';
import { SortService } from './sort.service';
import { TabChangeService } from './tab-change.service';
import { SearchService } from './search.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { AppConfigService } from './app-config-service.service';

import ResponseJson from '../testdata/searchresponse.json';

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

  it('should send API request to correct URL', () => {
    const searchResponseMock = ResponseJson;
    console.log(searchResponseMock);
    const http = TestBed.get(HttpTestingController);
    const tabChangeService = TestBed.get(TabChangeService);
    let searchResponse;

    searchService.singleInput = 'dadaa';
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
});