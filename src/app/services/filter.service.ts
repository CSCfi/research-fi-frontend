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


  constructor( private searchService: SearchService, private http: HttpClient) {
    this.sort = this.searchService.sort;
    this.sortMethod = this.searchService.sortMethod;
    this.fromPage = this.searchService.fromPage;
    this.requestCheck = this.searchService.requestCheck;
    this.singleInput = this.searchService.singleInput;
   }

  // Filters
  getFilter(filter: any) {
    this.res = [];
    if (filter.length > 0 && Array.isArray(filter)) {
      filter.forEach(value => {
        this.res.push({ term : { publicationYear : value } });
      });
    } else {
      this.res = { term : { publicationYear : filter } }; }
    }


  // Data for results page
  filterPublications(): Observable<Search[]> {
    this.singleInput = this.searchService.singleInput;
    if (this.sort === undefined) {this.searchService.getSortMethod(this.sortMethod); }
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
                  { term: { _index: 'funding' } }
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
    this.requestCheck = {};
    return this.http.post<Search[]>
    (this.apiUrl + 'publication,person,funding/_search?', this.payload)
    .pipe(catchError(this.searchService.handleError));

}
}
