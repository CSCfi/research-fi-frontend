import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private responseSource = new BehaviorSubject('');
  currentResponse = this.responseSource.asObservable();

  private totalReultsSource = new BehaviorSubject<number | string>(0);
  currentTotal = this.totalReultsSource.asObservable();

  totalResults: number | string = 0;

  constructor() { }

  changeResponse(response: any) {
    this.responseSource.next(response);
  }

  updateTotalResultsValue(amount: number | string) {
    this.totalReultsSource.next(amount);
    this.totalResults = amount;
  }
}
