//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfigService } from '@shared/services/app-config-service.service';

export interface Publication {
  hits: any;
}

@Injectable({
  providedIn: 'root',
})
export class PublicationsService {
  apiUrl: string;
  currentSort: any;
  pageSettings: any;

  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService
  ) {
    this.apiUrl = this.appConfigService.apiUrl;
  }

  updateSort(sortSettings) {
    switch (sortSettings.active) {
      case 'year': {
        this.currentSort = {
          publicationYear: { order: sortSettings.direction },
        };
      }
    }
  }

  updatePageSettings(pageSettings) {
    this.pageSettings = pageSettings;
  }

  getPublications(term) {
    // Default sort to descending publicationYear
    const sort = this.currentSort
      ? this.currentSort
      : { publicationYear: { order: 'desc' } };

    const pageSettings = this.pageSettings;

    const query = {
      query_string: {
        query: term,
      },
    };

    let payload = {
      track_total_hits: true,
      sort: sort,
      from: pageSettings ? pageSettings.pageIndex * pageSettings.pageSize : 0,
      size: pageSettings ? pageSettings.pageSize : 10,
    };

    if (term?.length) payload = Object.assign(payload, { query: query });

    // TODO: Map response
    return this.http.post<Publication>(
      this.apiUrl + 'publication/_search?',
      payload
    );
  }
}
