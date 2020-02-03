import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private responseSource = new BehaviorSubject('');
  currentResponse = this.responseSource.asObservable();

  private totalResultsSource = new BehaviorSubject<number | string>(0);
  currentTotal = this.totalResultsSource.asObservable();

  private errorSource = new Subject<HttpErrorResponse>();
  currentError = this.errorSource.asObservable();

  totalResults: number | string = 0;

  constructor() { }

  changeResponse(response: any) {
    this.responseSource.next(response);
  }

  updateError(error: HttpErrorResponse) {
    this.errorSource.next(error);
  }

  updateTotalResultsValue(amount: number | string) {
    this.totalResultsSource.next(amount);
    this.totalResults = amount;
  }
}
