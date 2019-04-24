import { Injectable, EventEmitter  } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { Subscription } from 'rxjs/internal/Subscription';
import { map, tap } from 'rxjs/operators';
import { Publication } from '../models/publication.model';
import { catchError } from 'rxjs/operators';

const API_URL = environment.apiUrl;

@Injectable()
export class SearchService {

  public inputSource = new BehaviorSubject('');
  currentInput = this.inputSource.asObservable();
  invokeFirstComponentFunction = new EventEmitter();
  subsVar: Subscription;
  input: any;
  restItems: any;
  restItemsUrl = API_URL;
  public data = {};
  term: any;

  constructor(private http: HttpClient) {  }

  changeInput(input: string) {
    this.inputSource.next(input);
  }

  onFirstComponentButtonClick() {
    console.log('Clicked');
    this.invokeFirstComponentFunction.emit();
    // this.getPublications();
    this.term = this.currentInput.subscribe(input => this.input = input);
    console.log(this.input);
  }

  getRestItems(): void {
    // this.http.get(this.restItemsUrl + 'publication_name=' + this.input).subscribe(responseData => console.log(responseData));
    this.http.get(this.restItemsUrl).subscribe(responseData => console.log(responseData));
  }

  getPublications(): Observable<Publication[]> {
    return this.http.get<Publication[]>(this.restItemsUrl + 'publication_name=' + this.input)
    // return this.http.get<Publication[]>('./assets/test.json')
    .pipe(
      // tap(data => console.log('All: ' + JSON.stringify(data))),
      catchError(this.handleError)
    );
}

private handleError(err: HttpErrorResponse) {
  // in a real world app, we may send the server to some remote logging infrastructure
  // instead of just logging it to the console
  let errorMessage = 'arrr';
  if (err.error instanceof Error) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
  } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`;
  }
  console.error(errorMessage);
  return Observable.throw(errorMessage);
}

  restItemsServiceGetRestItems() {
    // if input is null, return empty array
    // if (this.input === '') {
    //   return of(['']);
    // }
    return this.http
      .get<any[]>(this.restItemsUrl)
      .pipe(map(data => data));
  }

}
