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
  target: any;

  constructor( private staticDataService: StaticDataService) {
    this.indexList = 'publication,funding,infrastructure,organization' + '/_search?';
    this.aggsOnly = 'filter_path=aggregations';
  }

  strictFields(field) {
    this.exactField = field;
  }

  changeTarget(target) {
    this.target = target || null;
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
    targetFields = this.exactField ? this.exactField : this.staticDataService.queryFields(index);
    // const nestedFields = this.staticDataService.nestedQueryFields(index);

    if (this.exactField) {
      targetFields = this.exactField;
    } else if (this.target) {
      targetFields = this.staticDataService.targetFields(this.target, index);
    } else {
      targetFields = this.staticDataService.queryFields(index);
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
      must: [{
        term: {
          _index: index
        }
      },
      {
        bool: {
          should: [
            {
              multi_match: {
                query: term,
                analyzer: targetAnalyzer,
                type: targetType,
                fields: targetFields.length > 0 ? targetFields : '',
                operator: 'AND',
                lenient: 'true'
              }
            },
            {
              multi_match: {
                query: term,
                type: 'cross_fields',
                fields: targetFields.length > 0 ? targetFields : '',
                operator: 'AND',
                lenient: 'true'
              }
            },
            ...(index === 'publication' ? [{ bool: { should: this.generateNested('publication', term) } }] : []),
            ...(index === 'funding' ? [{ bool: { should: this.generateNested('funding', term) } }] : []),
          ]
        }
      }
    ]
    }
  };
    return res;
  }

  generateNested(index, term) {
    const targetFields = this.target ? this.staticDataService.targetNestedQueryFields(this.target, index) :
                                 this.staticDataService.nestedQueryFields(index);
    let res;
    switch (index) {
      case 'publication': {
        res = {
          nested: {
            path: 'author',
            query: {
              multi_match: {
                query: term,
                type: 'cross_fields',
                fields: targetFields.length > 0 ? targetFields : '',
                operator: 'AND',
                lenient: 'true'
              }
            }
          }
        };
        break;
      }
      case 'funding': {
        res = [{
          nested: {
            path: 'organizationConsortium',
            query: {
              multi_match: {
                query: term,
                type: 'cross_fields',
                fields: targetFields.length > 0 ? targetFields : '',
                operator: 'AND',
                lenient: 'true'
              }
            }
          }
        },
        {
          nested: {
            path: 'fundingGroupPerson',
            query: {
              multi_match: {
                query: term,
                type: 'cross_fields',
                fields: targetFields.length > 0 ? targetFields : '',
                operator: 'AND',
                lenient: 'true'
              }
            }
          }
        }];
        break;
      }
    }
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
                      this.querySettings('publication', term)
                    ]
                  }
                },
                {
                  bool: {
                    must: [
                      { term: { _index: 'funding'	}	},
                      this.querySettings('funding', term)
                    ]
                  }
                },
                {
                  bool: {
                    must: [
                      { term: { _index: 'infrastructure' }	},
                      this.querySettings('infrastructure', term)
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
                      this.querySettings('organization', term)
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
                infrastructure: {
                  match: {
                    _index: 'infrastructure'
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
        ...term ? this.completionsSettings(term) : []
      };
    return res;
  }

  // Completions fields
  completionsSettings(term: string) {
    const res = {
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
