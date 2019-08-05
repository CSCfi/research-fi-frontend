//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable  } from '@angular/core';
import { SearchService} from './search.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Search } from '../models/search.model';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { isArray } from 'ngx-bootstrap';

const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  sort: string;
  sortMethod: string;
  fromPage: number;
  requestCheck: boolean;
  singleInput: any;
  apiUrl = API_URL;
  selectedYears: any;
  res: any;
  payload: any;
  range: any;
  today: string;


  constructor( private searchService: SearchService, private http: HttpClient) {
    this.sort = this.searchService.sort;
    this.sortMethod = this.searchService.sortMethod;
    this.fromPage = this.searchService.fromPage;
    this.requestCheck = this.searchService.requestCheck;
    this.singleInput = this.searchService.singleInput;
   }

  // Filters
  getFilter(filter: any) {
    this.filterByYear(filter[0]);
    this.getRange(filter[1]);
    }

  filterByYear(filter: any) {
    this.res = [];
    if (!isArray(filter)) {filter = [filter]; }
    console.log(filter);
    const currentTab = this.searchService.currentTab;
    switch (currentTab) {
      case 'fundings': {
        if (Array.isArray(filter) && filter.length > 0 && filter[0] !== undefined) {
          filter.forEach(value => {
            this.res.push({ term : { fundingStartYear : value } });
          });
        } else {
            this.res = { exists : { field : 'fundingStartYear' } }; }
        break;
      }
      case 'publications': {
        if (Array.isArray(filter) && filter.length > 0) {
          filter.forEach(value => {
            this.res.push({ term : { publicationYear : value } });
          });
        } else {
            this.res = { exists : { field : 'publicationYear' } }; }
        break;
      }
    }
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
        this.range = { bool: { should: [ { exists : { field : 'fundingEndDate' } } ] } };
        break;
      }
    }
  }

  // Data for results page
  filterData(): Observable<Search[]> {
    this.singleInput = this.searchService.singleInput;
    this.payload = {
      query: {
        bool: {
          should: [
            {
              bool: {
                must: [
                  ...(this.singleInput ? [{ query_string : { query : this.singleInput } }] : []),
                  { term: { _index: 'publication' } },
                  { bool: { should: [ this.res ] } }
                ]
              }
            },
            {
              bool: {
                must: [
                  ...(this.singleInput ? [{ query_string : { query : this.singleInput } }] : []),
                  { term: { _index: 'person' } }
                ]
              }
            },
            {
              bool: {
                must: [
                  ...(this.singleInput ? [{ query_string : { query : this.singleInput } }] : []),
                  { term: { _index: 'funding' } },
                  { bool: { should: [ this.res ] } }
                ]
              }
            }
          ],
          boost: 1
        }
      },
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
                from: this.searchService.fromPage,
                sort: this.searchService.sort
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
            }
          }
        }
      }
    };
    this.requestCheck = false;
    return this.http.post<Search[]>
    (this.apiUrl + 'publication,person,funding/_search?', this.payload)
    .pipe(catchError(this.searchService.handleError));

}
}
