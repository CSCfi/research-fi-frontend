import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Search } from '../models/search.model';
import { Subject, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SearchService} from './search.service';
import { AppConfigService } from './app-config-service.service';


@Injectable({
  providedIn: 'root'
})
export class SingleItemService {
  apiUrl = '';
  publicationApiUrl = '';
  fundingApiUrl = '';
  organizationApiUrl = '';
  private getIdSubject = new Subject<string>();
  currentId = this.getIdSubject.asObservable();
  resultId: string;

  constructor( private http: HttpClient, private searchService: SearchService, private appConfigService: AppConfigService ) {
    this.apiUrl = this.appConfigService.apiUrl;
    this.publicationApiUrl = this.apiUrl + 'publication/_search';
    this.fundingApiUrl = this.apiUrl + 'funding/_search';
    this.organizationApiUrl = this.apiUrl + 'organization/_search';
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
