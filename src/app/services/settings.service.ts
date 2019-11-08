//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable } from '@angular/core';
import { StaticDataService } from './static-data.service';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
indexList: string;
aggsOnly: string;
exactField: string;

  constructor( private staticDataService: StaticDataService) {
    this.indexList = 'publication,person,funding,organization' + '/_search?';
    this.aggsOnly = 'filter_path=aggregations';
  }

  strictFields(field) {
    this.exactField = field;
  }

   // Global settings for query, auto-suggest settings are located in autosuggest.service
  querySettings(index: string, term: string) {
    // console.log(this.strictField)
    let targetFields: any;

    // Use exact field when doing a search from single document page
    if (this.exactField) {
      targetFields = this.exactField;
    } else {
      // Todo: Are two separate arrays needed for fields? In first version second array was for fields that needed exact match
      targetFields = this.staticDataService.queryFields(index).concat(this.staticDataService.queryExactFields(index))
    }

    const res = { bool: {
            should: [
              {
                multi_match: {
                  query: term,
                  analyzer: 'standard',
                  type: 'cross_fields',
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

  suggestSettings(term: string) {
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
}
