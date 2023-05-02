//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable } from '@angular/core';
import { StaticDataService } from './static-data.service';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  indexList: string;
  aggsOnly: string;
  target: any;
  // Related is used to indicate that query is done with different settings
  related = false;

  constructor(private staticDataService: StaticDataService) {
    let indices = [
      'publication',
      'person',
      'funding',
      'dataset',
      'funding-call',
      'infrastructure',
      'organization',
    ];

    this.indexList = indices.join(',') + '/_search?';
    this.aggsOnly = 'filter_path=aggregations';
  }

  changeTarget(target) {
    this.target = target || null;
  }

  // Global settings for query, auto-suggest settings are located in autosuggest.service
  querySettings(index: string, term: string = '') {
    let targetFields: any;
    let onlyDigits: any;
    let hasDigits: any;
    let targetAnalyzer: string;
    let targetType: string;

    // Targeted search uses exact fields for search
    // Related fields are used in single result pages
    if (this.target) {
      targetFields = this.staticDataService.targetFields(this.target, index);
    } else {
      targetFields = this.related
        ? this.staticDataService.relatedFields(index)
        : this.staticDataService.queryFields(index);
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
    const res = {
      bool: {
        must: [
          {
            term: {
              _index: index,
            },
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
                    lenient: 'true',
                    max_expansions: 1024,
                  },
                },
                {
                  multi_match: {
                    query: term,
                    type: 'cross_fields',
                    fields: targetFields.length > 0 ? targetFields : '',
                    operator: 'AND',
                    lenient: 'true',
                  },
                },
                // index === 'publication' was moved below the declaration
                // index === 'person' was moved below the declaration
                ...(index === 'funding'
                  ? [{ bool: { should: this.generateNested('funding', term) } }]
                  : []),
                ...(index === 'dataset'
                  ? [{ bool: { should: this.generateNested('dataset', term) } }]
                  : []),
                // News content field has umlauts converted to coded characters, query needs to be made with both coded and decoded umlauts
                ...(index === 'news'
                  ? [
                      {
                        multi_match: {
                          query: term
                            .replace(/ä/g, '&auml;')
                            .replace(/ä/g, '&ouml;'),
                          analyzer: targetAnalyzer,
                          type: targetType,
                          fields: targetFields.length > 0 ? targetFields : '',
                          operator: 'AND',
                          lenient: 'true',
                          max_expansions: 1024,
                        },
                      },
                      {
                        multi_match: {
                          query: term
                            .replace(/ä/g, '&auml;')
                            .replace(/ö/g, '&ouml;'),
                          type: 'cross_fields',
                          fields: targetFields.length > 0 ? targetFields : '',
                          operator: 'AND',
                          lenient: 'true',
                        },
                      },
                    ]
                  : []),
              ],
            },
          },
        ],
      },
    };

    if (index === 'publication') {
      const boosts = {
        publicationName: 2,
        publicationNameFuzzy: 0.4,
        authorsTextSplitted: 1.25,
        authorsTextSplittedFuzzy: 0.4,
        author: 0.4,
      };

      const matchPublicationName = {
        match: {
          publicationName: {
            query: term,
            boost: boosts.publicationName,
          }
        }
      };

      const matchPublicationNameFuzzy = {
        match: {
          publicationName: {
            query: term,

            fuzziness: 2,
            boost: boosts.publicationNameFuzzy,
          }
        }
      };

      const matchAuthorsTextSplitted = {
        match: {
          authorsTextSplitted: {
            query: term,
            operator: 'and',
            boost: boosts.authorsTextSplitted,
          }
        }
      };

      const matchAuthorsTextSplittedFuzzy = {
        match: {
          authorsTextSplitted: {
            query: term,
            operator: 'and',
            fuzziness: 2,
            boost: boosts.authorsTextSplittedFuzzy,
          }
        }
      };

      const matchAuthor = {
        bool: {
          should: this.generateNested('publication', term),
          boost: boosts.author
        }
      };

      const matchKeywords = {
        match: {
          "keywords.keyword": {
            query: term,
          }
        }
      }

      const matchJournalName = {
        match_phrase_prefix: {
          journalName: {
            query: term,
          }
        }
      };

      const matchJufo = {
        match: {
          jufoCode: {
            query: term,
          }
        }
      };

      // New match statements
      if (this.target === "name") {
        res.bool.must[1].bool.should = [
          matchAuthorsTextSplitted,
          // matchAuthorsTextSplittedFuzzy,
          matchAuthor
        ] as any;
      } else {
        res.bool.must[1].bool.should = [
          matchPublicationName,
          // matchPublicationNameFuzzy,
          matchAuthorsTextSplitted,
          // matchAuthorsTextSplittedFuzzy,
          matchAuthor,
          matchKeywords,
          matchJufo,
          matchJournalName
        ] as any;
      }
    }

    if (index === 'person') {
      // New match statements
      if (this.target === "name") {
        (res.bool.must[1].bool as any).must_not = [
          {"match_all": {}}
        ];
      } else {
        res.bool.must[1].bool.should = [
        {
          multi_match: {
            query: term,
            analyzer: targetAnalyzer,
            type: targetType,
            fields: targetFields.length > 0 ? targetFields : '',
            operator: 'AND',
            lenient: 'true',
            max_expansions: 1024
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
        {
          nested: {
            path: 'activity.affiliations',
            query: {
              bool: {
                should: [
                  {
                    multi_match: {
                      query: term,
                      type: 'best_fields',
                      operator: 'OR',
                      fields: [
                        'activity.affiliations.organizationNameFi',
                        'activity.affiliations.organizationNameSv',
                        'activity.affiliations.organizationNameEn',

                        'activity.educations.nameFi',
                        'activity.educations.nameSv',
                        'activity.educations.nameEn',

                        'activity.affiliations.positionNameFi',
                        'activity.affiliations.positionNameSv',
                        'activity.affiliations.positionNameEn',
                      ],
                      lenient: 'true'
                    }
                  }
                ]
              }
            }
          }
        }
      ] as any;
      }
    }

    return res;
  }

  // Fields with nested type need different query syntax with path
  generateNested(index, term) {
    const targetFields = this.target
      ? this.staticDataService.targetNestedQueryFields(this.target, index)
      : this.related
      ? this.staticDataService.nestedRelatedFields(index)
      : this.staticDataService.nestedQueryFields(index);

    const query = (path) => ({
      nested: {
        path: path,
        query: {
          multi_match: {
            query: term,
            type: 'cross_fields',
            fields: targetFields.length > 0 ? targetFields : '',
            operator: 'AND',
            lenient: 'true',
          },
        },
      },
    });

    let res;
    switch (index) {
      case 'publication': {
        res = query('author');
        break;
      }
      case 'funding': {
        res = [
          query('organizationConsortium'),
          query('fundingGroupPerson'),
          query('keywords'),
        ];
        break;
      }
      case 'dataset': {
        res = query('actor.sector');
        break;
      }
    }
    return res;
  }

  autoSuggestSettings(term: string = '') {
    const res = {
      query: {
        bool: {
          should: [
            {
              bool: {
                must: [
                  { term: { _index: 'publication' } },
                  this.querySettings('publication', term),
                ],
              },
            },
            {
              bool: {
                must: [
                  { term: { _index: 'funding' } },
                  this.querySettings('funding', term),
                ],
              },
            },
            {
              bool: {
                must: [
                  { term: { _index: 'dataset' } },
                  this.querySettings('dataset', term),
                ],
              },
            },
            {
              bool: {
                must: [
                  { term: { _index: 'infrastructure' } },
                  this.querySettings('infrastructure', term),
                ],
              },
            },
            {
              bool: {
                must: [
                  { term: { _index: 'funding-call' } },
                  this.querySettings('funding-call', term),
                ],
              },
            },
            {
              bool: {
                must: [
                  { term: { _index: 'person' } },
                  {
                    bool: {
                      should: [
                        {
                          multi_match: {
                            query: term,
                            analyzer: 'standard',
                            fields: ['firstName', 'lastName'],
                            operator: 'and',
                            prefix_length: 1,
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
            {
              bool: {
                must: [
                  { term: { _index: 'organization' } },
                  this.querySettings('organization', term),
                ],
              },
            },
          ],
          boost: 1,
        },
      },
      aggs: {
        _index: {
          filters: {
            filters: {
              person: {
                match: {
                  _index: 'person',
                },
              },
              publication: {
                match: {
                  _index: 'publication',
                },
              },
              funding: {
                match: {
                  _index: 'funding',
                },
              },
              dataset: {
                bool: {
                  must: [
                    {
                      match: {
                        _index: 'dataset',
                      },
                    },
                    {
                      term: {
                        isLatestVersion: 1,
                      },
                    },
                  ],
                },
              },
              infrastructure: {
                match: {
                  _index: 'infrastructure',
                },
              },
              organization: {
                match: {
                  _index: 'organization',
                },
              },
              fundingCalls: {
                match: {
                  _index: 'funding-call',
                },
              },
            },
          },
          aggs: {
            index_results: {
              top_hits: {
                size: 3,
              },
            },
          },
        },
      },
      ...(term ? this.completionsSettings(term) : []),
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
              fuzziness: 0,
            },
          },
        },
      },
    };
    return res;
  }
}
