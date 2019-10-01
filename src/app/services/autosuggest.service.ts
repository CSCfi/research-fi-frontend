//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs/Observable';
import { AppConfigService } from './app-config-service.service';

@Injectable()
export class AutosuggestService {
  apiUrl = '';

  constructor(private http: HttpClient, private appConfigService: AppConfigService) {
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
                          { fuzzy: { publicationName: { value: terms,
                            fuzziness: 'AUTO',
                            max_expansions: 50,
                            prefix_length: 0,
                            transpositions: true,
                            rewrite: 'constant_score' } } },
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
                          { fuzzy: { projectNameFi: { value: terms,
                            fuzziness: 'AUTO',
                            max_expansions: 50,
                            prefix_length: 0,
                            transpositions: true,
                            rewrite: 'constant_score' } } },
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
                        // fuzziness: 'auto',
                        prefix_length: 1
                      }}]}
              }]}},
              {
                bool: {
                  must: [
                    { term: { _index: 'organization'	}	},
                    {	bool:
                      {	should: [
                          { fuzzy: { nameFi: { value: terms,
                            fuzziness: 'AUTO',
                            max_expansions: 50,
                            prefix_length: 0,
                            transpositions: true,
                            rewrite: 'constant_score' } } },
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
      }
    };
    return this.http.post(this.apiUrl + 'publication,person,funding,organization/_search?filter_path=aggregations', payLoad);
    }

}
