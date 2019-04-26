// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { Injectable, EventEmitter  } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { Subscription } from 'rxjs/internal/Subscription';
import { Search } from '../models/search.model';
import { catchError } from 'rxjs/operators';

const API_URL = environment.apiUrl;

@Injectable()
export class SearchService {
  public inputSource = new BehaviorSubject('');
  currentInput = this.inputSource.asObservable();
  invokeGetData = new EventEmitter();
  subsVar: Subscription;
  input: any;
  apiUrl = API_URL;

  constructor(private http: HttpClient) {  }

  changeInput(input: string) {
    this.inputSource.next(input);
  }

  onSearchButtonClick() {
    console.log('Clicked');
    this.getPublications();
    console.log(this.input);
    this.invokeGetData.emit();
  }

  getAll(): Observable<Search[]> {
      return this.http.get<Search[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  getPublications(): Observable<Search[]> {
    this.currentInput.subscribe(input => this.input = input);

    if (this.input === undefined || this.input === '') {
      return this.http.get<Search[]>(this.apiUrl);
    } else {
      return this.http.get<Search[]>(this.apiUrl + '?q=publication_name=' + this.input)
      .pipe(catchError(this.handleError));
    }
  }

  private handleError(err: HttpErrorResponse) {
    let errorMessage = 'arrr';
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
