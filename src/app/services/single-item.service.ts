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
  getId$: Observable<any>;
  private getIdSubject = new Subject<any>();
  singlePublicationId: any;
  singleFundingId: any;

  constructor( private http: HttpClient, private searchService: SearchService ) {
    this.getId$ = this.getIdSubject.asObservable();
   }

  getPublicationId(singleId) {
    this.singlePublicationId = singleId;
    this.getIdSubject.next(singleId);
}

  getFundingId(singleId) {
    this.singleFundingId = singleId;
    this.getIdSubject.next(singleId);
}

  getSinglePublication(): Observable<Search[]> {
    return this.http.get<Search[]>(this.publicationApiUrl + '?&q=publicationId=' + this.singlePublicationId)
    .pipe(catchError(this.searchService.handleError));
  }

  getSingleFunding(): Observable<Search[]> {
    return this.http.get<Search[]>(this.fundingApiUrl + '?&q=funderProjectNumber=' + this.singleFundingId)
    .pipe(catchError(this.searchService.handleError));
  }

}
