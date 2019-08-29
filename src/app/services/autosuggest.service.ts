//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs/Observable';
import { debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';

const API_URL = environment.apiUrl;

@Injectable()
export class AutosuggestService {
    apiUrl = API_URL;

    constructor(private http: HttpClient) { }

    search(terms: Observable<string>) {
      return terms.pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap(term => this.searchEntries(term)));
    }

    searchEntries(term) {
        console.log('term:', term)
      return this.http
          .get(this.apiUrl + 'publication,person,funding,organization/_search?' + term)
          .pipe(map(res => res));
    }

}
