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
  invokeGetData = new EventEmitter();
  singleInput: string;
  pageNumber: number;
  fromPage: number;
  apiUrl = API_URL;

  private inputSource = new BehaviorSubject('');
  currentInput = this.inputSource.asObservable();

  private totalSource = new BehaviorSubject(undefined);
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
    this.invokeGetData.emit();
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
  getAll(): Observable<Search[]> {
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
  getAllResults(): Observable<Search[]> {
    const payLoad = {
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
          },
          aggs: {
            years: {
              terms: {
                field: this.sortService.sortField,
                size: 50,
                order : { _key : 'desc' }
              }
            },
            fieldsOfScience: {
              terms: {
                field: 'fields_of_science.nameFiScience.keyword',
                size: 250,
                order: {
                  _key: 'asc'
                }
              },
              aggs: {
                fieldId: {
                  terms: {
                    field: 'fields_of_science.fieldIdScience'
                  }
                }
              }
            }
          }
        }
      }
   };
    if (this.singleInput === undefined || this.singleInput === '') {
      return this.http.post<Search[]>(this.apiUrl + 'publication,person,funding,organization/_search?', payLoad);
    } else {
      return this.http.post<Search[]>
      (this.apiUrl + 'publication,person,funding,organization/_search?q=' + this.singleInput, payLoad)
      .pipe(catchError(this.handleError));
    }
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
