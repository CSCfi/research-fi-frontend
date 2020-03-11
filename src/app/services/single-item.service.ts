import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Search } from '../models/search.model';
import { Subject, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SearchService} from './search.service';
import { AppConfigService } from './app-config-service.service';
import { SettingsService } from './settings.service';


@Injectable({
  providedIn: 'root'
})
export class SingleItemService {
  apiUrl: any;
  publicationApiUrl = '';
  fundingApiUrl = '';
  organizationApiUrl = '';
  private getIdSubject = new Subject<string>();
  currentId = this.getIdSubject.asObservable();
  resultId: string;

  constructor( private http: HttpClient, private searchService: SearchService, private appConfigService: AppConfigService,
               private settingsService: SettingsService ) {
    this.apiUrl = this.appConfigService.apiUrl;
    this.publicationApiUrl = this.apiUrl + 'publication/_search';
    this.fundingApiUrl = this.apiUrl + 'funding/_search';
    this.organizationApiUrl = this.apiUrl + 'organization/_search';
  }

  updateId(singleId: string) {
    this.resultId = singleId;
    this.getIdSubject.next(singleId);
  }

  constructPayload(field, term) {
    const res = {
      query: {
        match: {
          [field]: term
        }
      }
    };
    return res;
  }

  getSinglePublication(id): Observable<Search[]> {
    return this.http.post<Search[]>(this.publicationApiUrl, this.constructPayload('publicationId', id))
    .pipe(catchError(this.searchService.handleError));
  }

  getSingleFunding(id): Observable<Search[]> {
    return this.http.post<Search[]>(this.fundingApiUrl, this.constructPayload('projectId', id))
    .pipe(catchError(this.searchService.handleError));
  }

  getSingleOrganization(id): Observable<Search[]> {
    return this.http.post<Search[]>(this.organizationApiUrl, this.constructPayload('organizationId', id))
    .pipe(catchError(this.searchService.handleError));
  }

  // Testing purposes only
  getCount(id): Observable<Search[]> {
    const payload = {
      query: {
        bool: {
          should: [
            {
              nested: {
                path: 'author',
                query: {
                  bool: {
                    should: [
                      {
                        term: {
                          'author.organization.organizationId.keyword': id
                        }
                      }
                    ]
                  }
                }
              }
            }
          ]
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
              },
              infrastructures: {
                match: {
                  _index: 'infrastructure'
                }
              },
              organizations: {
                match: {
                  _index: 'organization'
                }
              }
            }
          }
        }
      }
    };
    return this.http.post<Search[]>(this.apiUrl + this.settingsService.indexList + this.settingsService.aggsOnly, payload);
  }

  joinEntries(field, subField) {
    // Delete empty entries
    field.map(x => (x[subField].trim() === '') && delete x[subField] );
    // Remove empty objects
    const checkedArr = field.filter(value => Object.keys(value).length !== 0);
    return checkedArr.length > 1 ? checkedArr.map(x => x[subField]).trim().join(', ') : checkedArr[0][subField];
  }
}
