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
import { Page, PageAdapter } from '../models/page.model';
import {
  Sector,
  SectorAdapter,
} from '../models/research-innovation-system/sector.model';
import { map } from 'rxjs/operators';
import { AppConfigService } from './app-config-service.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ContentDataService {
  apiUrl: string;
  private pageSource = new BehaviorSubject([]);
  pageData = this.pageSource.asObservable();
  pageDataFlag = false;

  constructor(
    private http: HttpClient,
    private shortcutAdapter: ShortcutAdapter,
    private figureAdapter: FigureAdapter,
    private pageAdapter: PageAdapter,
    private sectorAdapter: SectorAdapter,
    private appConfigService: AppConfigService
  ) {
    this.apiUrl = this.appConfigService.cmsUrl + '/apis/v1/';
  }

  /*
   * Get data from backend
   */
  getShortcuts(): Observable<Shortcut[]> {
    return this.http
      .get<Shortcut[]>(this.apiUrl + 'shortcuts/')
      .pipe(map((data) => this.shortcutAdapter.adaptMany(data)));
  }

  getFigures(): Observable<Figure[]> {
    return this.http
      .get<Figure[]>(this.apiUrl + 'figures/')
      .pipe(map((data) => this.figureAdapter.adaptMany(data)));
  }

  getPages(): Observable<Page[]> {
    return this.http
      .get<Page[]>(this.apiUrl + 'pages/')
      .pipe(map((data) => this.pageAdapter.adaptMany(data)));
  }

  getSectors(): Observable<Sector[]> {
    return this.http
      .get<Sector[]>(this.apiUrl + 'sectors/')
      .pipe(map((data) => this.sectorAdapter.adaptMany(data)));
  }

  /*
   * Set data
   */
  setPageData(data: any) {
    this.pageDataFlag = true;
    this.pageSource.next(data);
  }
}
