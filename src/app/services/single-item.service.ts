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
  apiUrl = API_URL + 'publication/_search';
  getId$: Observable<any>;
  private getIdSubject = new Subject<any>();
  singleItemId: any;

  constructor( private http: HttpClient, private searchService: SearchService ) {
    this.getId$ = this.getIdSubject.asObservable();
   }

  getId(singleId) {
    this.singleItemId = singleId;
    this.getIdSubject.next(singleId);
}

  getSingle(): Observable<Search[]> {
    return this.http.get<Search[]>(this.apiUrl + '?&q=publicationId=' + this.singleItemId)
    .pipe(catchError(this.searchService.handleError));
  }

}
