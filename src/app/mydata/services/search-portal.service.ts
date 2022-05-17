import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfigService } from '@shared/services/app-config-service.service';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Search, SearchAdapter } from '@portal/models/search.model';
import { SettingsService } from '@portal/services/settings.service';
import { AppSettingsService } from '@shared/services/app-settings.service';

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
  locale: string;

  private termSource = new BehaviorSubject<string>('');
  currentTerm = this.termSource.asObservable();

  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService,
    private searchAdapter: SearchAdapter,
    private searchSettingsService: SettingsService,
    private appSettingsService: AppSettingsService
  ) {
    this.locale = this.appSettingsService.capitalizedLocale;

    this.apiUrl = this.appConfigService.apiUrl;
  }

  updateSort(
    groupId: string,
    sortSettings: { active: string; direction: string }
  ) {
    let sortField: string;

    switch (sortSettings.active) {
      case 'year': {
        sortField = this.getDefaultSortField(groupId);
        break;
      }
      case 'name': {
        switch (groupId) {
          case 'publication': {
            sortField = 'publicationName.keyword';
            break;
          }
          case 'dataset': {
            sortField = `name${this.locale}.keyword`;
            break;
          }
          case 'funding': {
            sortField = `projectName${this.locale}.keyword`;
            break;
          }
        }
      }
    }

    return (this.currentSort = {
      [sortField]: {
        order: sortSettings.direction,
      },
    });
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
