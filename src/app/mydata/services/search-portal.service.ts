import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfigService } from '@shared/services/app-config-service.service';
import { BehaviorSubject } from 'rxjs';
import { DatasetAdapter } from '@portal/models/dataset/dataset.model';
import { map } from 'rxjs/operators';
import { Search, SearchAdapter } from '@portal/models/search.model';
import { SettingsService } from '@portal/services/settings.service';

export interface Respone {
  hits: any;
}

@Injectable({
  providedIn: 'root',
})
export class SearchPortalService {
  apiUrl: string;
  currentSort: any;
  pageSettings: any;
  httpOptions: object;

  private termSource = new BehaviorSubject<string>('');
  currentTerm = this.termSource.asObservable();

  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService,
    private searchAdapter: SearchAdapter,
    private searchSettingsService: SettingsService
  ) {
    // this.apiUrl = this.appConfigService.apiUrl;
    this.apiUrl =
      'https://researchfi-api-production-researchfi.rahtiapp.fi/portalapi/'; // Hardcoded production data url for dev purposes
  }

  updateSort(groupId: string, sortSettings) {
    switch (sortSettings.active) {
      case 'year': {
        this.currentSort = {
          [this.getDefaultSortField(groupId)]: {
            order: sortSettings.direction,
          },
        };
      }
    }
  }

  getDefaultSortField(groupId) {
    let defaultSortField: string;

    switch (groupId) {
      case 'publication': {
        defaultSortField = 'publicationYear';
        break;
      }
      case 'dataset': {
        defaultSortField = 'datasetCreated';
        break;
      }
      case 'funding': {
        defaultSortField = 'fundingStartYear';
        break;
      }
    }

    return defaultSortField;
  }

  resetSort() {
    // this.currentSort = {
    //   publicationYear: { order: 'desc' },
    // };
    this.currentSort = null;
  }

  updateSearchTerm(term: string) {
    this.termSource.next(term);
  }

  updatePageSettings(pageSettings) {
    this.pageSettings = pageSettings;
  }

  getData(term: string, groupId: string) {
    // Default sort to descending
    const sort = this.currentSort
      ? this.currentSort
      : {
          [this.getDefaultSortField(groupId)]: { order: 'desc' },
        };

    const pageSettings = this.pageSettings;

    // Leverage query generation method from portal
    const query = this.searchSettingsService.querySettings(groupId, term);

    let payload = {
      track_total_hits: true,
      sort: sort,
      from: pageSettings ? pageSettings.pageIndex * pageSettings.pageSize : 0,
      size: pageSettings ? pageSettings.pageSize : 10,
    };

    if (term?.length) payload = Object.assign(payload, { query: query });

    // TODO: Map response
    return this.http
      .post<Search>(this.apiUrl + `${groupId}/_search?`, payload)
      .pipe(map((data: any) => this.searchAdapter.adapt(data, groupId + 's')));
  }
}
