//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable, EventEmitter  } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Search, SearchAdapter } from '../models/search.model';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SortService } from './sort.service';
import { FilterService } from './filter.service';
import { TabChangeService } from './tab-change.service';
import { StaticDataService } from './static-data.service';
import { AppConfigService } from './app-config-service.service';
import { SettingsService } from './settings.service';
import { Publication } from '../models/publication.model';
import { News, NewsAdapter } from '../models/news.model';

@Injectable()
export class SearchService {
  singleInput: string;
  pageNumber: number;
  newsPageNumber: number;
  fromPage: number;
  fromNewsPage: number;
  apiUrl: any;
  pageSize: number;

  // Variables to help with search term redirections
  tabValues: any;
  redirecting = false;

  private inputSource = new BehaviorSubject<string>('');
  currentInput = this.inputSource.asObservable();

  private totalSource = new Subject<any>();
  currentTotal = this.totalSource.asObservable();

  private querySource = new BehaviorSubject({});
  currentQueryParams = this.querySource.asObservable();

  private errorSource = new BehaviorSubject<string>('noError');
  connError = this.errorSource.asObservable();

  constructor(private http: HttpClient , private sortService: SortService, private tabChangeService: TabChangeService,
              private filterService: FilterService, private appConfigService: AppConfigService, private settingsService: SettingsService,
              private searchAdapter: SearchAdapter, private newsAdapter: NewsAdapter) {
      this.apiUrl = this.appConfigService.apiUrl;
  }

  updateInput(searchTerm: string) {
    this.tabChangeService.resetQueryParams();
    this.singleInput = searchTerm;
    this.inputSource.next(searchTerm);
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
  updatePageNumber(pageNumber: number) {
    this.pageNumber = pageNumber;
    this.fromPage = this.pageNumber * 10 - 10;
    if (isNaN(this.pageNumber) || this.pageNumber < 0) {
      this.fromPage = 0;
      this.pageNumber = 1;
    }
  }

  // We use different method for news page number
  updateNewsPageNumber(pageNumber: number) {
    this.newsPageNumber = pageNumber;
    this.fromNewsPage = this.newsPageNumber * 10 - 10;
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
        _index: {filters : {
          filters: {
            persons : { match : { _index : 'person' }},
            publications : { match : { _index : 'publication' }},
            fundings : { match : { _index : 'funding' }},
            infrastructures : { match : { _index : 'infrastructure' }},
            organizations : { match : { _index : 'organization' }}
          }
        }}
      }
    };
    return this.http.post<Search[]>(this.apiUrl + this.settingsService.indexList + 'request_cache=true', payLoad);
      // .pipe(catchError(this.handleError));
  }

  getData(): Observable<Search> {
    const payload = this.filterService.constructPayload(this.singleInput, this.fromPage, this.pageSize,
                                                        this.sortService.sort, this.tabChangeService.tab);
    return this.http.post<Search>(this.apiUrl + this.tabChangeService.tab.slice(0, -1) + '/_search?', payload)
                    .pipe(map((data: any) => this.searchAdapter.adapt(data, this.tabChangeService.tab)));
  }

  // Data for results page
  getTabValues(): Observable<Search[]> {
    this.settingsService.querySettings(this.tabChangeService.tab, this.singleInput);
    const payLoad = {
      ...(this.singleInput ? { query: {
        bool: {
          should: [
            this.settingsService.querySettings('publication', this.singleInput),
            this.settingsService.querySettings('person', this.singleInput),
            this.settingsService.querySettings('funding', this.singleInput),
            this.settingsService.querySettings('infrastructure', this.singleInput),
            this.settingsService.querySettings('organization', this.singleInput)
          ]
        }
      }, } : []),
      size: 0,
      aggs: {
        _index: {
          filters: {
            filters: {
              persons: {
                match: {
                    _index: 'person'
                }
              },
              publications: {
                match: {
                    _index: 'publication'
                }
              },
              fundings: {
                match: {
                    _index: 'funding'
                }
              },
              infrastructures: {
                match: {
                    _index: 'infrastructure'
                }
              },
              organizations: {
                match: {
                    _index: 'organization'
                }
              }
            }
          }
        }
      }
    };
    return this.http.post<Search[]>(this.apiUrl + this.settingsService.indexList + 'request_cache=true', payLoad);
  }

  getFilters(): Observable<Search[]> {
    const aggs = this.filterService.constructFilterPayload(this.tabChangeService.tab, this.singleInput);
    return this.http.post<Search[]>(this.apiUrl + this.tabChangeService.tab.slice(0, -1) + '/_search?', aggs);
  }

  //
  getQueryFilters(): Observable<Search[]> {
    const query = this.filterService.constructPayload(this.singleInput, this.fromPage, this.pageSize,
      this.sortService.sort, this.tabChangeService.tab);
    const aggs = this.filterService.constructFilterPayload(this.tabChangeService.tab, this.singleInput);
    const payload = Object.assign(query, aggs);
    return this.http.post<Search[]>(this.apiUrl + this.tabChangeService.tab.slice(0, -1) + '/_search?', payload);
  }

  getNewsFilters(): Observable<Search[]> {
    const payLoad = {
      size: 0,
      aggs: {
        organization: {
          terms: {
            field: 'organizationId.keyword',
            size: 50
          },
          aggs: {
            orgName: {
              terms: {
                field: 'organizationNameFi.keyword'
              }
            }
          }
        }
      }
    };
    return this.http.post<Search[]>(this.apiUrl + 'news/_search?', payLoad);
  }

  // A simple method that returns the response from the url provided
  getFromUrl(url: string, options?: {headers: HttpHeaders}): Observable<any> {
    return this.http.get(url, options);
  }

  // News page content
  getNews(size?: number): Observable<News[]> {
    // TODO: Remove when timestamp is in text format in both test and production data
    const sort = !this.apiUrl.includes('production') ? {'timestamp.keyword': {order: 'desc'}} : {timestamp: {order: 'desc'}};
    const payload = {
      query: this.filterService.constructNewsPayload(),
      size,
      sort: [
        sort
      ]
    };

    return this.http.post<News[]>(this.apiUrl + 'news' + '/_search?', payload).pipe(map(data => this.newsAdapter.adaptMany(data)));
  }

    // News page older news content
    getOlderNews(size?: number): Observable<News[]> {
      // TODO: Remove when timestamp is in text format in both test and production data
      const sort = !this.apiUrl.includes('production') ? {'timestamp.keyword': {order: 'desc'}} : {timestamp: {order: 'desc'}};
      const payload = {
        query: this.filterService.constructNewsPayload(),
        size,
        from: this.fromNewsPage + 5,
        sort: [
          sort
        ]
      };

      return this.http.post<News[]>(this.apiUrl + 'news' + '/_search?', payload).pipe(map(data => this.newsAdapter.adaptMany(data)));
    }
}
