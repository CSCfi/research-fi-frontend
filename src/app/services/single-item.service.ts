import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Search } from '../models/search.model';
import { Subject, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SearchService} from './search.service';

const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class SingleItemService {
  publicationApiUrl = API_URL + 'publication/_search';
  fundingApiUrl = API_URL + 'funding/_search';
  organizationApiUrl = API_URL + 'organization/_search';
  private getIdSubject = new Subject<string>();
  currentId = this.getIdSubject.asObservable();
  resultId: string;

  constructor( private http: HttpClient, private searchService: SearchService ) {
   }

  updateId(singleId: string) {
    this.resultId = singleId;
    this.getIdSubject.next(singleId);
  }

  getSinglePublication(id): Observable<Search[]> {
    return this.http.get<Search[]>(this.publicationApiUrl + '?&q=publicationId=' + id)
    .pipe(catchError(this.searchService.handleError));
  }

  getSingleFunding(id): Observable<Search[]> {
    return this.http.get<Search[]>(this.fundingApiUrl + '?&q=projectId:' + id)
    .pipe(catchError(this.searchService.handleError));
  }

  getSingleOrganization(id): Observable<Search[]> {
    return this.http.get<Search[]>(this.organizationApiUrl + '?&q=organizationId=' + id)
    .pipe(catchError(this.searchService.handleError));
  }

}
