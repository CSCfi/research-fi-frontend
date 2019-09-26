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

const API_URL = environment.apiUrl;

@Injectable()
export class SearchService {
  singleInput: string;
  pageNumber: number;
  fromPage: number;
  apiUrl = API_URL;

  // Variables to help with search term redirections
  tabValues: any;
  redirecting = false;

  private inputSource = new BehaviorSubject<string>('');
  currentInput = this.inputSource.asObservable();

  private totalSource = new Subject<number | string>();
  currentTotal = this.totalSource.asObservable();

  private querySource = new BehaviorSubject({});
  currentQueryParams = this.querySource.asObservable();

  constructor(private http: HttpClient , private sortService: SortService, private tabChangeService: TabChangeService,
              private filterService: FilterService) {
  }

  updateInput(searchTerm: string) {
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

  queryFields(index) {
    let res = [];
    switch (index) {
      case 'publication': {
        res = ['publicationName', 'authorsText', 'journalName'];
        break;
      }
      case 'person': {
        res = ['firstName', 'lastName'];
        break;
      }
      case 'funding': {
        res = ['projectNameFi', 'fundedNameFi', 'funderNameFi'];
        break;
      }
      case 'organization': {
        res = ['ornameFiga', 'sectorNameFi'];
        break;
      }
    }
    return res;
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
    return this.http.post<Search[]>(this.apiUrl + 'publication,person,funding,organization/_search?', payLoad)
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
    const payLoad = {
      query: {
        bool: {
          should: [
            { bool: {
                must: [{
                  term: {
                    _index: 'publication'
                }},
                { bool: {
                    should: [{
                      multi_match: {
                        query: this.singleInput,
                        analyzer: 'standard',
                        fields: this.queryFields('publication'),
                        fuzziness: 'auto'
                      }
                    }]
                  }
                }],
                boost: 1
              }
            },
            {
            bool: {
              must: [{
                term: {
                  _index: 'person'
              }},
              { bool: {
                  should: [{
                    multi_match: {
                      query: this.singleInput,
                      analyzer: 'standard',
                      fields: this.queryFields('person'),
                      fuzziness: 'auto'
                    }
                  }]
                }
              }],
              boost: 1
            }
          },
          {
            bool: {
              must: [{
                term: {
                  _index: 'funding'
              }},
              { bool: {
                  should: [{
                    multi_match: {
                      query: this.singleInput,
                      analyzer: 'standard',
                      fields: this.queryFields('funding'),
                      fuzziness: 'auto'
                    }
                  }]
                }
              }],
              boost: 1
            }
          },
          {
            bool: {
              must: [{
                term: {
                  _index: 'organization'
              }},
              { bool: {
                  should: [{
                    multi_match: {
                      query: this.singleInput,
                      analyzer: 'standard',
                      fields: this.queryFields('organization'),
                      fuzziness: 'auto'
                    }
                  }]
                }
              }],
              boost: 1
            }
          }
        ]
        }
      },
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
    const queryTerm = this.singleInput ? 'q=' + this.singleInput : '';
    return this.http.post<Search[]>(this.apiUrl + 'publication,person,funding,organization/_search?', payLoad)
      .pipe(catchError(this.handleError));
  }

  getFilters(): Observable<Search[]> {
    const payLoad = this.filterService.constructFilterPayload(this.tabChangeService.tab, this.singleInput, this.queryFields(this.tabChangeService.tab));
    // queryTerm pois ja payloadiin samat multi matchit kun normi haussa
    const queryTerm = this.singleInput ? 'q=' + this.singleInput : '';
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
      errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`;
    }
    console.error(errorMessage);
    // tslint:disable-next-line: deprecation
    return Observable.throw(errorMessage);
  }

}
