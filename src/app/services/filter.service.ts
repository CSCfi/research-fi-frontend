//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable  } from '@angular/core';
import { SearchService} from './search.service';
import { SortService } from './sort.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Search } from '../models/search.model';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { isArray } from 'ngx-bootstrap';
import { isString } from 'ngx-bootstrap/chronos/utils/type-checks';

const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  fromPage: number;
  requestCheck: boolean;
  singleInput: any;
  apiUrl = API_URL;
  selectedYears: any;
  res: any;
  payload: any;
  range: any;
  today: string;
  yearFilters: any;
  fieldFilters: any;


  constructor(private sortService: SortService, private http: HttpClient) { }

  // Filters
  getFilter(filter: any) {
    console.log(filter);
    this.filterByYear(filter.year);
    this.getRange(filter.status);
    this.filterByFieldOfScience(filter.field);
    }

  filterByYear(filter: any) {
    this.res = [];
    const currentTab = this.sortService.currentTab;

    switch (currentTab) {
      case 'fundings': {
        filter.forEach(value => {
          this.res.push({ term : { fundingStartYear : value } });
        });
        break;
      }
      case 'publications': {
        filter.forEach(value => {
          this.res.push({ term : { publicationYear : value } });
        });
        break;
      }
    }
  }

  filterByFieldOfScience(field: any) {
    this.fieldFilters = [];
    field.forEach(value => {
      this.fieldFilters.push({ term : { 'fields_of_science.nameFiScience.keyword' : value } });
    });
  }

  // Start & end date filtering
  getRange(range: string) {
    this.today = new Date().toISOString().substr(0, 10).replace('T', ' ');
    switch (JSON.stringify(range)) {
      case '["onGoing"]':
      case '"onGoing"': {
        this.range = { range: { fundingEndDate: {gte : '2017-01-01' } } };
        break;
      }
      case '["ended"]':
      case '"ended"': {
        this.range = { range: { fundingEndDate: {lte : '2017-01-01' } } };
        break;
      }
      default: {
        this.range = undefined;
        break;
      }
    }
  }

  constructQuery(index: string, searchTerm: string) {
    return {
        bool: {
          should: [
            {
              bool: {
                must: [
                  { term: { _index: index } },
                  ...(searchTerm ? [{ query_string : { query : searchTerm } }] : []),
                  ...(index === 'funding' ? (this.range ? [this.range] : []) : []),
                  ...(this.res.flat().length ? { bool: { should: this.res } } : this.res.flat()),
                  ...(this.fieldFilters.flat().length ? { bool: { should: this.fieldFilters } } : this.fieldFilters.flat())
                ]
              }
            }
          ],
        }
    };
  }

  // Data for results page
  constructPayload(searchTerm: string, fromPage, sortOrder, tab) {
    const query = this.constructQuery(tab.slice(0, -1), searchTerm);
    return {
      query,
      size: 0,
      aggs: {
        _index: {
          filters: {
            filters: {
              persons: {
                match: {
                  _index: 'person'
                }
              },
              publications: {
                match: {
                  _index: 'publication'
                }
              },
              fundings: {
                match: {
                  _index: 'funding'
                }
              }
            }
          },
          aggs: {
            index_results: {
              top_hits: {
                size: 10,
                from: fromPage,
                sort: sortOrder
              }
            },
            years: {
              terms: {
                field: 'publicationYear',
                size: 50,
                order: {
                  _key: 'asc'
                }
              }
            },
            fieldsOfScience: {
              terms: {
                field: 'fields_of_science.nameFiScience.keyword',
                size: 150,
                order : { _key : 'asc' }
              }
            }
          }
        }
      }
    };
  }
}
