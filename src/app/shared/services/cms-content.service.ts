//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { Shortcut, ShortcutAdapter } from '../../portal/models/shortcut.model';
import { Figure, FigureAdapter } from '../../portal/models/figure/figure.model';
import { Page, PageAdapter } from '../../portal/models/page.model';
import {
  ExternalLinkGroup,
  ExternalLinkGroupAdapter,
} from '../../portal/models/research-innovation-system/external-link-group.model';
import {
  Sector,
  SectorAdapter,
} from '../../portal/models/research-innovation-system/sector.model';
import { map } from 'rxjs/operators';
import { AppConfigService } from 'src/app/shared/services/app-config-service.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CMSContentService {
  apiUrl: string;
  private pageSource = new BehaviorSubject([]);
  pageData = this.pageSource.asObservable();
  pageDataLoaded = false;

  constructor(
    private http: HttpClient,
    private shortcutAdapter: ShortcutAdapter,
    private figureAdapter: FigureAdapter,
    private pageAdapter: PageAdapter,
    private sectorAdapter: SectorAdapter,
    private externalLinkAdapter: ExternalLinkGroupAdapter,
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

  getExternalLinks(): Observable<ExternalLinkGroup[]> {
    return this.http
      .get<ExternalLinkGroup[]>(this.apiUrl + 'external_links/')
      .pipe(map((data) => this.externalLinkAdapter.adaptMany(data)));
  }

  /*
   * Set data
   */
  setPageData(data: any) {
    this.pageDataLoaded = true;
    this.pageSource.next(data);
  }
}
