//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { SearchService } from '../../services/search.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit, OnDestroy {
  input: any = [];
  isSearching: boolean;
  responseData: any [];
  errorMessage = [];
  status = false;
  fromPage = 0;
  panelOpenState: boolean;
  expandStatus: Array<boolean> = [];
  @ViewChild('singleId') singleId: ElementRef;

  constructor(private searchService: SearchService) {
    this.isSearching = false;
  }

  ngOnInit() {
    // Get input
    this.searchService.currentInput.subscribe(input => this.input = input);

    // Reset pagination
    this.searchService.from = 0;

    // Get search data when coming from other than results page
    this.getData();

    // Listen for search button action on results page
    if (this.input !== null || this.searchService.subsVar === undefined) {
      this.searchService.subsVar = this.searchService.
      invokeGetData.subscribe(() => {
        // Reset pagination
        this.searchService.from = 0;
        this.fromPage = 0;
        // Get search data
        this.getData();
      });
    }

  }

  getData() {
    this.searchService.getPublications()
    .pipe(map(responseData => [responseData]))
    .subscribe(responseData => this.responseData = responseData,
      error => this.errorMessage = error as any);
  }

  nextPage() {
    this.fromPage = this.fromPage + 10;
    this.searchService.nextFrom();
    this.getData();
  }

  previousPage() {
    this.fromPage = this.fromPage - 10;
    this.searchService.previousFrom();
    this.getData();
  }

  increaseEvent(i: number): void {
    this.status = !this.status;
  }

  // Unsubscribe from search term to prevent memory leaks
  ngOnDestroy() {
    this.searchService.subsVar.unsubscribe();
  }

}
