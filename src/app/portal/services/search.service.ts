//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Search, SearchAdapter } from '../models/search.model';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SortService } from './sort.service';
import { FilterService } from './filters/filter.service';
import { TabChangeService } from './tab-change.service';
import { AppConfigService } from 'src/app/shared/services/app-config-service.service';
import { SettingsService } from './settings.service';
import { News, NewsAdapter } from '../models/news.model';
import {
  VisualAdapter,
  Visual,
} from '../models/visualisation/visualisations.model';
import { AggregationService } from './filters/aggregation.service';
import {
  FundingCall,
  FundingCallAdapter,
} from '@portal/models/funding-call.model';
import { AppSettingsService } from '@shared/services/app-settings.service';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  searchTerm: string;
  pageNumber: number;
  newsPageNumber: number;
  fromPage: number;
  fromNewsPage: number;
  apiUrl: any;
  pageSize: number;
  localeC: string;

  // Variables to help with search term redirections
  tabValues: any;
  redirecting = false;

  previousSearchTerm = '';

  private inputSource = new BehaviorSubject<string>('');
  currentInput = this.inputSource.asObservable();

  private totalSource = new Subject<any>();
  currentTotal = this.totalSource.asObservable();

  private querySource = new BehaviorSubject({});
  currentQueryParams = this.querySource.asObservable();

  private errorSource = new BehaviorSubject<string>('noError');
  connError = this.errorSource.asObservable();

  constructor(
    private http: HttpClient,
    private sortService: SortService,
    private tabChangeService: TabChangeService,
    private filterService: FilterService,
    private appConfigService: AppConfigService,
    private settingsService: SettingsService,
    private appSettingsService: AppSettingsService,
    private searchAdapter: SearchAdapter,
    private newsAdapter: NewsAdapter,
    private visualAdapter: VisualAdapter,
    private aggService: AggregationService
  ) {
    this.apiUrl = this.appConfigService.apiUrl;
    this.localeC = this.appSettingsService.capitalizedLocale;
  }

  updateInput(searchTerm: string) {
    if (searchTerm === '' || this.previousSearchTerm !== searchTerm) {
      this.previousSearchTerm = searchTerm;
      this.tabChangeService.resetQueryParams();
      this.searchTerm = searchTerm;
      this.inputSource.next(searchTerm);
    }
  }

  updateTotal(total: number) {
    this.totalSource.next(total);
  }

  updateQueryParams(params: any) {
    this.querySource.next(params);
  }

  onSearchButtonClick() {
    this.pageNumber = 1;
  }

  // Fetch page number from results page
  updatePageNumber(pageNumber: number, pageSize = this.pageSize) {
    this.pageNumber = pageNumber;
    this.fromPage = (this.pageNumber - 1) * pageSize;
    if (isNaN(this.pageNumber) || this.pageNumber < 0) {
      this.fromPage = 0;
      this.pageNumber = 1;
    }
  }

  // We use different method for news page number
  updateNewsPageNumber(pageNumber: number, pageSize: number = 5) {
    this.newsPageNumber = pageNumber;
    this.fromNewsPage = (this.newsPageNumber - 1) * pageSize;
    if (isNaN(this.newsPageNumber) || this.newsPageNumber < 0) {
      this.fromNewsPage = 0;
      this.newsPageNumber = 1;
    }
  }

  // Data for homepage values
  getAllResultCount(): Observable<Search[]> {
    const payLoad = {
      size: 0,
      aggs: {
        _index: {
          filters: {
            filters: {
              publications: { match: { _index: 'publication' } },
              persons: { match: { _index: 'person' } },
              fundings: { match: { _index: 'funding' } },
              datasets: { bool: { must :[{ match: { _index:'dataset' } }, { term: { isLatestVersion: 1 }}]}},
              infrastructures: { match: { _index: 'infrastructure' } },
              organizations: { match: { _index: 'organization' } },
              fundingCalls: { match: { _index: 'funding-call' } },
              projects: { match: { _index: 'project' } },
            },
          },
        },
      },
    };
    return this.http.post<Search[]>(
      this.apiUrl + this.settingsService.indexList + 'request_cache=true',
      payLoad
    );
    // .pipe(catchError(this.handleError));
  }

  getData(): Observable<Search> {
    const payload = this.filterService.constructPayload(
      this.searchTerm,
      this.fromPage,
      this.pageSize,
      this.sortService.sort,
      this.tabChangeService.tab
    );
    return this.http
      .post<Search>(
        this.apiUrl + this.tabChangeService.tab.slice(0, -1) + '/_search?',
        payload
      )
      .pipe(
        map((data: any) =>
          this.searchAdapter.adapt(data, this.tabChangeService.tab)
        )
      );
  }

  // Data for results page
  getTabValues(): Observable<Search[]> {
    this.settingsService.querySettings(
      this.tabChangeService.tab,
      this.searchTerm
    );
    const payLoad = {
      ...(this.searchTerm
        ? {
            query: {
              bool: {
                should: [
                  this.settingsService.querySettings(
                    'publication',
                    this.searchTerm
                  ),
                  this.settingsService.querySettings('person', this.searchTerm),
                  this.settingsService.querySettings(
                    'funding',
                    this.searchTerm
                  ),
                  this.settingsService.querySettings(
                    'dataset',
                    this.searchTerm
                  ),
                  this.settingsService.querySettings(
                    'infrastructure',
                    this.searchTerm
                  ),
                  this.settingsService.querySettings(
                    'organization',
                    this.searchTerm
                  ),
                  this.settingsService.querySettings(
                    'funding-call',
                    this.searchTerm
                  ),
                  this.settingsService.querySettings(
                    'project',
                    this.searchTerm
                  ),
                ],
              },
            },
          }
        : []),
      size: 0,
      aggs: {
        _index: {
          filters: {
            filters: {
              publications: {
                match: {
                  _index: 'publication',
                },
              },
              persons: {
                match: {
                  _index: 'person',
                },
              },
              fundings: {
                match: {
                  _index: 'funding',
                },
              },
              // Datasets can have multiple different versions.
              // Aggregate only latest datasets.
              // Filter query for datasets is declared in filter.service
              datasets: {
                bool: {
                  must: [
                    {
                      match: {
                        _index: 'dataset',
                      },
                    },
                    {
                      term: {
                        isLatestVersion: 1,
                      },
                    },
                  ],
                },
              },
              infrastructures: {
                match: {
                  _index: 'infrastructure',
                },
              },
              organizations: {
                match: {
                  _index: 'organization',
                },
              },
              fundingCalls: {
                match: {
                  _index: 'funding-call',
                },
              },
              projects: {
                match: {
                  _index: 'project',
                },
              },
            },
          },
        },
      },
    };
    return this.http.post<Search[]>(
      this.apiUrl + this.settingsService.indexList + 'request_cache=true',
      payLoad
    );
  }

  getFilters(): Observable<Search[]> {
    const aggs = this.filterService.constructFilterPayload(
      this.tabChangeService.tab,
      this.searchTerm
    );
    const tab =
      this.tabChangeService.tab === 'news'
        ? this.tabChangeService.tab
        : this.tabChangeService.tab.slice(0, -1);
    return this.http.post<Search[]>(this.apiUrl + tab + '/_search?', aggs);
  }

  // Used to translate active filters
  getAllFilters(tab): Observable<Search[]> {
    const currentTab = tab === 'news' ? tab : tab.slice(0, -1);
    const aggs = this.aggService.constructAggregations(
      this.filterService.constructFilters(tab.slice(0, -1)) as any,
      tab,
      '',
      true
    );
    return this.http.post<Search[]>(
      this.apiUrl + currentTab + '/_search?' + 'request_cache=true',
      aggs
    );
  }

  getVisualData(
    categoryIdx: number,
    fundingAmount = false
  ): Observable<Visual> {
    // Need to check against tab since navigation from results to news causes problems since getVisualData is called from filters.
    if (this.tabChangeService.tab !== 'news') {
      const aggs = this.filterService.constructVisualPayload(
        this.tabChangeService.tab,
        this.searchTerm,
        categoryIdx
      );
      return this.http
        .post<Search[]>(
          this.apiUrl + this.tabChangeService.tab.slice(0, -1) + '/_search?',
          aggs
        )
        .pipe(
          map((data: any) =>
            this.visualAdapter.adapt(
              data,
              this.tabChangeService.tab,
              categoryIdx,
              fundingAmount
            )
          )
        );
    }
  }

  //
  getQueryFilters(): Observable<Search[]> {
    const query = this.filterService.constructPayload(
      this.searchTerm,
      this.fromPage,
      this.pageSize,
      this.sortService.sort,
      this.tabChangeService.tab
    );
    const aggs = this.filterService.constructFilterPayload(
      this.tabChangeService.tab,
      this.searchTerm
    );
    const payload = Object.assign(query, aggs);
    return this.http.post<Search[]>(
      this.apiUrl + this.tabChangeService.tab.slice(0, -1) + '/_search?',
      payload
    );
  }

  getNewsFilters(): Observable<Search[]> {
    const aggs = this.filterService.constructFilterPayload(
      'news',
      this.searchTerm
    );
    const payload = Object.assign(aggs);
    return this.http.post<Search[]>(this.apiUrl + 'news/_search?', payload);
  }

  // A simple method that returns the response from the url provided
  getFromUrl(url: string, options?: { headers: HttpHeaders }): Observable<any> {
    return this.http.get(url, options);
  }

  // News page content
  getNews(size?: number, from: number = 0): Observable<News[]> {
    const sort = { timestamp: { order: 'desc' } };
    const payload = {
      query: this.filterService.constructNewsPayload(this.searchTerm),
      size,
      sort: [sort],
      from: from,
    };

    return this.http
      .post<News[]>(
        this.apiUrl + 'news' + '/_search?' + 'request_cache=true',
        payload
      )
      .pipe(map((data) => this.newsAdapter.adaptMany(data)));
  }

  // News page older news content
  getOlderNews(size?: number): Observable<News[]> {
    const sort = { timestamp: { order: 'desc' } };
    const payload = {
      query: this.filterService.constructNewsPayload(this.searchTerm),
      size,
      from: this.fromNewsPage,
      sort: [sort],
    };

    return this.http
      .post<News[]>(
        this.apiUrl + 'news' + '/_search?' + 'request_cache=true',
        payload
      )
      .pipe(map((data) => this.newsAdapter.adaptMany(data)));
  }

  // News page content
  getHomepageFundingCalls(size = 5): Observable<Search> {
    const sort = {
      callProgrammeDueDate: { order: 'asc' },
      [`foundation.name${this.localeC}.keyword`]: {
        order: 'asc',
        unmapped_type: 'long',
      },
    };
    const payload = {
      query: this.filterService.constructFundingCallPayload(),
      size,
      sort: [sort],
    };

    return this.http
      .post<Search>(this.apiUrl + 'funding-call' + '/_search?', payload)
      .pipe(map((data) => this.searchAdapter.adapt(data, 'funding-calls')));
  }

  getFundingCallFilters(): Observable<Search[]> {
    const aggs = this.filterService.constructFilterPayload(
      'funding-calls',
      this.searchTerm
    );
    const payload = Object.assign(aggs);
    return this.http.post<Search[]>(
      this.apiUrl + 'funding-call/_search?',
      payload
    );
  }
}
