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

   // Global settings for query
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
                  type: 'most_fields',
                  fields: this.staticDataService.queryFields(index),
                  operator: 'or',
                  lenient: 'true',
                  fuzziness: '1',
                  prefix_length: 1
                }
              },
              {
                multi_match: {
                  query: term,
                  analyzer: 'standard',
                  type: 'most_fields',
                  fields: this.staticDataService.queryExactFields(index),
                  lenient: 'true',
                  prefix_length: 1,
                  boost: 2
                }
              }
            ]
          }
        }]}};
    return res;
  }
}
