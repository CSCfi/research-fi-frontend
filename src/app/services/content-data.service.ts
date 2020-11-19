//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ContentDataService {
  apiUrl: string;
  constructor(private http: HttpClient) {
    this.apiUrl = 'http://127.0.0.1:8000/apis/v1/';
   }

  // Get data from backend
  getData(source) {
    return this.http.get(this.apiUrl + source);
  }
}
