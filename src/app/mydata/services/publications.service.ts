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

  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService
  ) {
    this.apiUrl = this.appConfigService.apiUrl;
  }

  getPublications(term) {
    const query = {
      query_string: {
        query: term,
      },
    };

    const sort = [{ publicationYear: { order: 'desc' } }];

    let payload = {
      track_total_hits: true,
      sort: sort,
    };

    if (term.length) payload = Object.assign(payload, { query: query });

    // TODO: Map response
    return this.http.post<Publication>(
      this.apiUrl + 'publication/_search?',
      payload
    );
  }
}
