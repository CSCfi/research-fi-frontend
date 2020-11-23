//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { Shortcut, ShortcutAdapter } from '../models/shortcut.model';
import { Figure, FigureAdapter } from '../models/figure/figure.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ContentDataService {
  apiUrl: string;
  constructor(private http: HttpClient, private shortcutAdapter: ShortcutAdapter, private figureAdapter: FigureAdapter) {
    this.apiUrl = 'http://127.0.0.1:8000/apis/v1/';
   }

  /*
   * Get data from backend
   */

  getShortcuts(): Observable<Shortcut[]> {
    return this.http.get<Shortcut[]>(this.apiUrl + 'shortcuts/')
    .pipe(map(data => this.shortcutAdapter.adaptMany(data)));
  }

  getFigures(): Observable<Figure[]> {
    return this.http.get<Figure[]>(this.apiUrl + 'figures/')
    .pipe(map(data => this.figureAdapter.adaptMany(data)));
  }
}
