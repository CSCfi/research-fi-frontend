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
import { Subscription } from 'rxjs/internal/Subscription';
import { catchError } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { SortService } from './sort.service';
import { FilterService } from './filter.service';

const API_URL = environment.apiUrl;

@Injectable()
export class SearchService {
  public inputSource = new BehaviorSubject('');
  currentInput = this.inputSource.asObservable();
  invokeGetData = new EventEmitter();
  // subsVar: Subscription;
  getInput$: Observable<any>;
  private getInputSubject = new Subject<any>();
  singleInput: any;
  pageNumber: any;
  fromPage: any;
  input: any;
  apiUrl = API_URL;
  data: any;

  constructor(private http: HttpClient, private route: ActivatedRoute, private sortService: SortService, 
              private filterService: FilterService) {
    this.getInput$ = this.getInputSubject.asObservable();
  }

  // Get input value from url
  getInput(searchTerm: string) {
    this.singleInput = searchTerm;
    this.getInputSubject.next(searchTerm);
  }

  onSearchButtonClick() {
    this.invokeGetData.emit();
    this.pageNumber = 1;
  }

  // Fetch page number from results page
  getPageNumber(searchTerm: number) {
    this.getInputSubject.next(searchTerm);
    this.pageNumber++;
    this.pageNumber = searchTerm;
    this.fromPage = this.pageNumber * 10 - 10;
    if (isNaN(this.pageNumber) || this.pageNumber < 0) {
      this.fromPage = 0;
      this.pageNumber = 1;
    }
  }

  // Detect change in input value
  changeInput(input: string) {
    this.inputSource.next(input);
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

  filterData() {
    const payload = this.filterService.constructPayload(this.singleInput, this.fromPage,
                                                        this.sortService.sort, this.sortService.currentTab);
    return this.http.post<Search[]>(this.apiUrl + 'publication,person,funding/_search?', payload)
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
                  index_results: {
                      top_hits: {
                          size: 10,
                          from: this.fromPage,
                          sort: this.sortService.sort
                      }
                  },
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
                      size: 150,
                      order : { _key : 'asc' }
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
