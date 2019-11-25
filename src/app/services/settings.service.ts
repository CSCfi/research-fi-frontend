//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable } from '@angular/core';
import { StaticDataService } from './static-data.service';
import { isNumber } from 'util';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
indexList: string;
aggsOnly: string;
exactField: any;

  constructor( private staticDataService: StaticDataService) {
    this.indexList = 'publication,person,funding,organization' + '/_search?';
    this.aggsOnly = 'filter_path=aggregations';
  }

  strictFields(field) {
    this.exactField = field;
  }

   // Global settings for query, auto-suggest settings are located in autosuggest.service
  querySettings(index: string, term: any) {
    if (this.exactField === this.exactField) {this.exactField = undefined; }
    let targetFields: any;
    let onlyDigits: any;
    let hasDigits: any;
    let targetAnalyzer: string;
    let targetType: string;

    // Use exact field when doing a search from single document page
    if (this.exactField) {
      targetFields = this.exactField;
    } else {
      // Todo: Are two separate arrays needed for fields? In first version second array was for fields that needed exact match
      targetFields = this.staticDataService.queryFields(index).concat(this.staticDataService.queryExactFields(index));
    }

    // Set analyzer & type
    onlyDigits = /^\d+$/.test(term);
    hasDigits = /\d/.test(term);

    if (hasDigits) {
      targetAnalyzer = 'standard';
      if (onlyDigits) {
        targetType = 'phrase_prefix';
      } else {
        targetType = 'cross_fields';
      }
    } else {
      targetAnalyzer = 'standard';
      targetType = 'phrase_prefix';
    }

    const res = { bool: {
            should: [
              {
                multi_match: {
                  query: term,
                  analyzer: targetAnalyzer,
                  type: targetType,
                  fields: targetFields,
                  operator: 'AND',
                  lenient: 'true'
                }
              },
              {
                multi_match: {
                  query: term,
                  fields: targetFields,
                  operator: 'AND',
                  lenient: 'true'
                }
              }
            ]
          }
        };
    return res;
  }

  // Completions fields
  completionsSettings(term: string) {
    const res = {
      suggest: {
        mySuggestions: {
          prefix: term,
          completion: {
            field: 'completions',
            size: 5,
            skip_duplicates: true,
            fuzzy: {
              fuzziness: 0
            }
          }
        }
      }
    };
    return res;
  }

  autoSuggestSettings(term: string) {
    const res = {
      query: {
          bool: {
              should: [
                {
                  bool: {
                    must: [
                      { term: { _index: 'publication'	}	},
                      {	bool:
                        {	should: [
                              {match_phrase_prefix: { publicationName: { query: term }}}
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
                              {match_phrase_prefix: { projectNameFi: { query: term }}}
                          ]
                        }
                      }
                    ]
                  }
                },
                { bool: {
                  must: [{ term: { _index: 'person' }},
                  { bool: { should: [{ multi_match: {
                          query: term,
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
                              {match_phrase_prefix: { nameFi: { query: term }}}
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
        suggest: {
          mySuggestions: {
            prefix: term.split(' ').splice(-1),
            completion: {
              field: 'completions',
              size: 5,
              skip_duplicates: true,
              fuzzy: {
                fuzziness: 0
              }
            }
          }
        }
      };
    return res;
  }
}
