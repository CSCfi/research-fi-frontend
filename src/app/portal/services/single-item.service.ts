//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Search, SearchAdapter } from '../models/search.model';
import { Subject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppConfigService } from 'src/app/shared/services/app-config-service.service';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root',
})
export class SingleItemService {
  apiUrl: any;
  publicationApiUrl = '';
  fundingApiUrl = '';
  datasetApiUrl = '';
  organizationApiUrl = '';
  infrastructureApiUrl = '';
  private getIdSubject = new Subject<string>();
  currentId = this.getIdSubject.asObservable();
  resultId: string;

  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService,
    private settingsService: SettingsService,
    private searchAdapter: SearchAdapter
  ) {
    this.apiUrl = this.appConfigService.apiUrl;
    this.publicationApiUrl = this.apiUrl + 'publication/_search';
    this.fundingApiUrl = this.apiUrl + 'funding/_search';
    this.datasetApiUrl = this.apiUrl + 'dataset/_search';
    this.organizationApiUrl = this.apiUrl + 'organization/_search';
    this.infrastructureApiUrl = this.apiUrl + 'infrastructure/_search';
  }

  updateId(singleId: string) {
    this.resultId = singleId;
    this.getIdSubject.next(singleId);
  }

  constructPayload(field, term) {
    const res = {
      query: {
        match: {
          [field]: term,
        },
      },
      size: 1,
    };
    return res;
  }

  getSinglePublication(id): Observable<Search> {
    return this.http
      .post<Search>(
        this.publicationApiUrl,
        this.constructPayload('publicationId', id)
      )
      .pipe(map((data: any) => this.searchAdapter.adapt(data, 'publications')));
  }

  getSingleFunding(id): Observable<Search> {
    return this.http
      .post<Search>(this.fundingApiUrl, this.constructPayload('projectId', id))
      .pipe(map((data: any) => this.searchAdapter.adapt(data, 'fundings')));
  }
  getSingleDataset(id): Observable<Search> {
    return this.http
      .post<Search>(this.datasetApiUrl, this.constructPayload('identifier', id))
      .pipe(map((data: any) => this.searchAdapter.adapt(data, 'datasets')));
  }

  getSingleOrganization(id): Observable<Search> {
    return this.http
      .post<Search>(
        this.organizationApiUrl,
        this.constructPayload('organizationId', id)
      )
      .pipe(
        map((data: any) => this.searchAdapter.adapt(data, 'organizations'))
      );
  }

  getSingleInfrastructure(id): Observable<Search> {
    return this.http
      .post<Search>(
        this.infrastructureApiUrl,
        this.constructPayload('nameFi', id)
      )
      .pipe(
        map((data: any) => this.searchAdapter.adapt(data, 'infrastructures'))
      );
  }

  getCount(tab, id, filters): Observable<any> {
    // Reset target so query settings are reseted
    this.settingsService.changeTarget(null);
    // Set target fields
    this.settingsService.related = true;
    const payLoad = {
      ...(id
        ? {
            query: {
              bool: {
                should: [
                  this.settingsService.querySettings(
                    'publication',
                    id.replace('-', '')
                  ),
                  this.settingsService.querySettings('person', id),
                  this.settingsService.querySettings('funding', id),
                  this.settingsService.querySettings('infrastructure', id),
                  this.settingsService.querySettings('organization', id),
                ],
              },
            },
          }
        : []),
      size: 0,
      aggs: {
        _index: {
          filters: {
            filters: {
              // persons: {
              //   match: {
              //     _index: 'person',
              //   },
              // },
              publications: {
                match: {
                  _index: 'publication',
                },
              },
              fundings: {
                match: {
                  _index: 'funding',
                },
              },
              infrastructures: {
                match: {
                  _index: 'infrastructure',
                },
              },
              organizations: {
                match: {
                  _index: 'organization',
                },
              },
            },
          },
        },
      },
    };
    return this.http.post<Search[]>(
      this.apiUrl + this.settingsService.indexList + 'request_cache=true',
      payLoad
    );
  }

  joinEntries(field, subField) {
    // Delete empty entries
    field.map((x) => x[subField].trim() === '' && delete x[subField]);
    // Remove empty objects
    const checkedArr = field.filter((value) => Object.keys(value).length !== 0);
    return checkedArr.length > 1
      ? checkedArr
          .map((x) => x[subField])
          .trim()
          .join(', ')
      : checkedArr[0][subField];
  }
}
