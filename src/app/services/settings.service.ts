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

  constructor( private staticDataService: StaticDataService) {
    this.indexList = 'publication,person,funding,organization' + '/_search?';
    this.aggsOnly = 'filter_path=aggregations';
   }

   // Global settings for query, auto-suggest settings are located in autosuggest.service
  querySettings(index: string, term: string) {
    const res = { bool: {
      must: [{ term: { _index: index }},
        {
          bool: {
            should: [
              {
                multi_match: {
                  query: term,
                  analyzer: 'standard',
                  type: 'cross_fields',
                  // Todo: Are two separate arrays needed for fields? In first version second array was for fields that needed exact match
                  fields: this.staticDataService.queryFields(index).concat(this.staticDataService.queryExactFields(index)),
                  operator: 'AND',
                  lenient: 'true'
                }
              },
              // {
              //   multi_match: {
              //     query: term,
              //     analyzer: 'standard',
              //     type: 'cross_fields',
              //     fields: this.staticDataService.queryExactFields(index),
              //     operator: 'AND',
              //     lenient: 'true'
              //   }
              // }
            ]
          }
        }]}};
    return res;
  }
}
