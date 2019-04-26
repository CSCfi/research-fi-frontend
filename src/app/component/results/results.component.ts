// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { Component, OnInit, OnDestroy } from '@angular/core';
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

  constructor(private searchService: SearchService) {
    this.isSearching = false;

  }

  ngOnInit() {
    // Get input
    this.searchService.currentInput.subscribe(input => this.input = input);

    // Get blank search data
    this.getData();

    // Listen for search button action
    if (this.input !== null || this.searchService.subsVar === undefined) {
      this.searchService.subsVar = this.searchService.
      invokeGetData.subscribe(() => {
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

  // Unsubscribe from search term to prevent memory leaks
  ngOnDestroy() {
    this.searchService.subsVar.unsubscribe();
  }

}
