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
  providedIn: 'root'
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
            sortField = 'publicationYear';
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

    this.currentSort = {
      [sortField]: {
        order: sortSettings.direction
      }
    };
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

    // Leverage query generation method from portal
    const finalQuery = {
      'bool': {
        'must': [{ 'term': { '_index': groupId } }, this.searchSettingsService.querySettings(groupId, term)]
      }
    };
    let sort = undefined;

    // Queries and sorts are different for publication category, default sort is descending
    if (groupId === 'publication') {
      const publicationSort = this.currentSort
        ? this.currentSort
        : {
          [this.getDefaultSortField(groupId)]: { order: 'desc' }
        };
      sort = ['_score', publicationSort, '_score'];
    } else {
      const generalSort = this.currentSort
        ? this.currentSort
        : {
          [this.getDefaultSortField(groupId)]: { order: 'desc', unmapped_type: 'long' }
        };
      sort = [generalSort, '_score', '_score'];
    }

    const pageSettings = this.pageSettings;

    let payload = {
      track_total_hits: true,
      sort: sort,
      from: pageSettings ? pageSettings.pageIndex * pageSettings.pageSize : 0,
      size: pageSettings ? pageSettings.pageSize : 10
    };

    if (term?.length) payload = Object.assign(payload, { query: finalQuery });

    // TODO: Map response
    return this.http
      .post<Search>(this.apiUrl + `${groupId}/_search?`, payload)
      .pipe(map((data: any) => this.searchAdapter.adapt(data, groupId + 's')));
  }
}
