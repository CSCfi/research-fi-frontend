import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private responseSource = new BehaviorSubject('');
  currentResponse = this.responseSource.asObservable();

  private activeFilterHeightSource = new BehaviorSubject(0);
  currentActiveFilterHeight = this.activeFilterHeightSource.asObservable();

  private totalResultsSource = new BehaviorSubject<number | string>(0);
  currentTotal = this.totalResultsSource.asObservable();

  private filterSource = new Subject<{ filter: string; key: string }>();
  newFilter = this.filterSource.asObservable();

  totalResults: number | string = 0;

  researchFigureScrollLocation = 0;

  resultTabList: any[] = [];

  constructor() {}

  changeResponse(response: any) {
    this.responseSource.next(response);
  }

  changeActiveFilterHeight(height: any) {
    this.activeFilterHeightSource.next(height);
  }

  updateTotalResultsValue(amount: number | string) {
    this.totalResultsSource.next(amount);
    this.totalResults = amount;
  }

  updateResearchScroll(value: number) {
    this.researchFigureScrollLocation = value;
  }

  changeFilter(filter: string, key: string) {
    this.filterSource.next({ filter: filter, key: key });
  }
}
