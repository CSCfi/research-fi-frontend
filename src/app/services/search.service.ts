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

const API_URL = environment.apiUrl;

@Injectable()
export class SearchService {
  public inputSource = new BehaviorSubject('');
  currentInput = this.inputSource.asObservable();
  invokeGetData = new EventEmitter();
  subsVar: Subscription;
  getInput$: Observable<any>;
  private getInputSubject = new Subject<any>();
  singleInput: any;
  pageNumber: any;
  fromPage: any;
  input: any;
  apiUrl = API_URL;
  data: any;
  sortMethod: string;
  private getSortByMethod = new Subject<any>();
  sortUrl: string;
  requestCheck: boolean;
  sort: any;
  urlSortMethod: any;

  constructor(private http: HttpClient, private route: ActivatedRoute) {
    this.getInput$ = this.getInputSubject.asObservable();
    this.sortMethod = 'desc';
    this.sortUrl = 'publicationYear:' + this.sortMethod;
    this.requestCheck = false;
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

  // Filters
  getFilter(filter: string) {

  }

  // Get sort method
  getSortMethod(sortMethod: string) {

    if (this.sortMethod ? undefined || null : this.sortMethod === 'desc') {}
    switch (this.sortMethod) {
      case 'desc': {
        this.sortUrl = 'publicationYear:' + this.sortMethod;
        this.sort = [{publicationYear: {order: this.sortMethod, unmapped_type : 'long'}}];
        break;
      }
      case 'asc': {
        this.sortUrl = 'publicationYear:' + this.sortMethod;
        this.sort = [{publicationYear: {order: this.sortMethod, unmapped_type : 'long'}}];
        break;
      }
      case 'name': {
        this.sortUrl = 'publicationName.keyword:' + 'asc';
        this.sort = [{'publicationName.keyword': {order: 'asc', unmapped_type : 'long'}}];
        break;
      }
      case 'person': {
        this.sortUrl = 'authorsText.keyword:' + 'asc';
        this.sort = [{'authorsText.keyword': {order: 'asc', unmapped_type : 'long'}}];
        break;
      }
      default: {
        this.sortUrl = 'publicationYear:' + 'desc';
        this.sort = [{publicationYear: {order: this.sortMethod, unmapped_type : 'long'}}];
        break;
      }
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
            fundings : { match : { _index : 'funding' }}
          }
        }}
      }
    };
    return this.http.post<Search[]>(this.apiUrl + 'publication,person,funding/_search?', payLoad)
      .pipe(catchError(this.handleError));
  }

  // Data for results page
  getAllResults(): Observable<Search[]> {
    if (this.sort === undefined) {this.getSortMethod(this.sortMethod); }
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
                      }
                  }
              },
              aggs: {
                  index_results: {
                      top_hits: {
                          size: 10,
                          from: this.fromPage,
                          sort: this.sort
                      }
                  },
                  years: {
                    terms: {
                      field: 'publicationYear',
                      size: 50,
                      order : { _key : 'desc' }
                    }
                  }
              }
          }
      }
   };
    this.requestCheck = false;
    if (this.singleInput === undefined || this.singleInput === '') {
      return this.http.post<Search[]>(this.apiUrl + 'publication,person,funding/_search?size=10&from='
      + this.fromPage, payLoad);
    } else {
      return this.http.post<Search[]>
      (this.apiUrl + 'publication,person,funding/_search?size=10&from=' + this.fromPage + '&q=publication_name='
      + this.singleInput, payLoad)
      .pipe(catchError(this.handleError));
    }
  }

  // // Data for pagination
  // getPublications(): Observable<Search[]> {
  //   this.requestCheck = true;
  //   // this.currentInput.subscribe(input => this.input = input);
  //   if (this.singleInput === undefined || this.singleInput === '') {
  //     // get this.form from value from url
  //     return this.http.get<Search[]>(this.apiUrl + 'publication/_search?size=10&from=' + this.fromPage + '&sort=' + this.sortUrl);
  //   } else {
  //     return this.http.get<Search[]>
  //     (this.apiUrl + 'publication/_search?size=10&from=' + this.fromPage + '&q=publication_name=' + this.singleInput
  //     + '&sort=' + this.sortUrl)
  //     .pipe(catchError(this.handleError));
  //   }
  // }

  getPersons(): Observable<Search[]> {
    this.currentInput.subscribe(input => this.input = input);
    if (this.singleInput === undefined || this.singleInput === '') {
      return this.http.get<Search[]>(this.apiUrl + 'person/_search?size=10&from=' + this.fromPage);
    } else {
      return this.http.get<Search[]>(this.apiUrl + 'person/_search?size=10&from=' + this.fromPage + '&q=lastName=' + this.singleInput)
      .pipe(catchError(this.handleError));
    }
  }

  getFundings(): Observable<Search[]> {
    this.currentInput.subscribe(input => this.input = input);
    if (this.singleInput === undefined || this.singleInput === '') {
      return this.http.get<Search[]>(this.apiUrl + 'funding/_search?size=10&from=' + this.fromPage);
    } else {
      return this.http.get<Search[]>(this.apiUrl + 'funding/_search?size=10&from=' + this.fromPage + '&q=fundedNameFi=' + this.singleInput)
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
