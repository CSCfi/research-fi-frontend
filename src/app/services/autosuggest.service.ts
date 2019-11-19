//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { AppConfigService } from './app-config-service.service';
import { SettingsService } from './settings.service';

@Injectable()
export class AutosuggestService {
  apiUrl: any;

  constructor(private http: HttpClient, private appConfigService: AppConfigService, private settingService: SettingsService) {
    this.apiUrl = this.appConfigService.apiUrl;
  }

  search(terms: Observable<string>) {
    const payLoad = {
    query: {
        bool: {
            should: [
              {
                bool: {
                  must: [
                    { term: { _index: 'publication'	}	},
                    {	bool:
                      {	should: [
                            {match_phrase_prefix: { publicationName: { query: terms }}}
                        ]
                      }
                    }
                  ]
                }
              },
              {
                bool: {
                  must: [
                    { term: { _index: 'funding'	}	},
                    {	bool:
                      {	should: [
                            {match_phrase_prefix: { projectNameFi: { query: terms }}}
                        ]
                      }
                    }
                  ]
                }
              },
              { bool: {
                must: [{ term: { _index: 'person' }},
                { bool: { should: [{ multi_match: {
                        query: terms,
                        analyzer: 'standard',
                        fields: ['firstName', 'lastName'],
                        operator: 'and',
                        prefix_length: 1
                      }}]}
              }]}},
              {
                bool: {
                  must: [
                    { term: { _index: 'organization'	}	},
                    {	bool:
                      {	should: [
                            {match_phrase_prefix: { nameFi: { query: terms }}}
                        ]
                      }
                    }
                  ]
                }
              }
          ],
          boost: 1
        }
      },
      aggs: {
        _index: {
          filters: {
            filters: {
              person: {
                match: {
                  _index: 'person'
                }
              },
              publication: {
                match: {
                  _index: 'publication'
                }
              },
              funding: {
                match: {
                  _index: 'funding'
                }
              },
              organization: {
                match: {
                  _index: 'organization'
                }
              }
            }
          },
          aggs: {
            index_results: {
              top_hits: {
                size: 3
              }
            }
          }
        }
      },
    };
    return this.http.post(this.apiUrl + this.settingService.indexList, payLoad);
    }

}
