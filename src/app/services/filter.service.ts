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

  constructor( private searchService: SearchService, private http: HttpClient) {
    this.sort = this.searchService.sort;
    this.sortMethod = this.searchService.sortMethod;
    this.fromPage = this.searchService.fromPage;
    this.requestCheck = this.searchService.requestCheck;
    this.singleInput = this.searchService.singleInput;
   }

  // Data for results page
  filterPublications(): Observable<Search[]> {
    if (this.sort === undefined) {this.searchService.getSortMethod(this.sortMethod); }
    const payLoad = {
      query: {
          bool : {
            must :
              { query_string : { query : this.singleInput } }
            ,
            should : [
              { term : { publicationYear : 2018} },
              { term : { publicationYear : 2016} },
              { term : { publicationYear : 2014} }

            ],
            minimum_should_match : 1,
            boost : 1.0
          }
        },
        size: 0,
        aggs: {
          _index: {
            filters: {
              filters: {
                tutkijat: {
                  match: {
                    _index: 'person'
                  }
                },
                julkaisut: {
                  match: {
                    _index: 'publication'
                  }
                },
                hankkeet: {
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
                  from: 0,
                  sort: [
                    {
                      'authorsText.keyword': {
                        order: 'asc',
                        unmapped_type: 'long'
                      }
                    }
                  ]
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
    if (this.singleInput === undefined || this.singleInput === '') {
      return this.http.post<Search[]>(this.apiUrl + 'publication,person,funding/_search?size=10&from='
      + this.fromPage, payLoad);
    } else {
      return this.http.post<Search[]>
      (this.apiUrl + 'publication,person,funding/_search?size=10&from=' + this.fromPage + '&q=publication_name='
      + this.singleInput, payLoad)
      .pipe(catchError(this.searchService.handleError));
    }
  }

}
