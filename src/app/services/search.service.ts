//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable, EventEmitter  } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Search } from '../models/search.model';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SortService } from './sort.service';
import { FilterService } from './filter.service';
import { TabChangeService } from './tab-change.service';
import { StaticDataService } from './static-data.service';
import { AppConfigService } from './app-config-service.service';
import { SettingsService } from './settings.service';

@Injectable()
export class SearchService {
  singleInput: string;
  pageNumber: number;
  fromPage: number;
  apiUrl: any;

  // Variables to help with search term redirections
  tabValues: any;
  redirecting = false;

  private inputSource = new BehaviorSubject<string>('');
  currentInput = this.inputSource.asObservable();

  private totalSource = new Subject<number | string>();
  currentTotal = this.totalSource.asObservable();

  private querySource = new BehaviorSubject({});
  currentQueryParams = this.querySource.asObservable();

  private errorSource = new BehaviorSubject<string>('noError');
  connError = this.errorSource.asObservable();

  constructor(private http: HttpClient , private sortService: SortService, private tabChangeService: TabChangeService,
              private filterService: FilterService, private appConfigService: AppConfigService, private settingsService: SettingsService) {
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
            organizations : { match : { _index : 'organization' }}
          }
        }}
      }
    };
    return this.http.post<Search[]>(this.apiUrl + this.settingsService.indexList, payLoad)
      .pipe(catchError(this.handleError));
  }

  getData() {
    const payload = this.filterService.constructPayload(this.singleInput, this.fromPage,
                                                        this.sortService.sort, this.tabChangeService.tab);
    return this.http.post<Search[]>(this.apiUrl + this.tabChangeService.tab.slice(0, -1) + '/_search?', payload)
    .pipe(catchError(this.handleError));
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
    // const queryTerm = this.singleInput ? 'q=' + this.singleInput : '';
    return this.http.post<Search[]>(this.apiUrl + this.settingsService.indexList, payLoad)
      .pipe(catchError(this.handleError));
  }

  getFilters(): Observable<Search[]> {
    const payLoad = this.filterService.constructFilterPayload(this.tabChangeService.tab, this.singleInput);
    // const queryTerm = this.singleInput ? 'q=' + this.singleInput : '';
    return this.http.post<Search[]>(this.apiUrl + this.tabChangeService.tab.slice(0, -1) + '/_search?', payLoad)
      .pipe(catchError(this.handleError));
  }

  // Error handling
  public handleError(err: HttpErrorResponse) {
    let errorMessage = 'HTTPError';
    if (err.error instanceof Error) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      this.errorSource.next('connection');
      errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`;
    }
    console.error(errorMessage);
    // tslint:disable-next-line: deprecation
    return Observable.throw(errorMessage);
  }
}
