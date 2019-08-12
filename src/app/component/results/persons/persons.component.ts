//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { SearchService } from 'src/app/services/search.service';
import { FilterService } from 'src/app/services/filter.service';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-persons',
  templateUrl: '../persons/persons.component.html',
  styleUrls: ['./persons.component.scss']
})
export class PersonsComponent implements OnInit, OnDestroy {
  personData: any [];
  filter: object;
  filterSub: Subscription;
  filtersOn: boolean;
  errorMessage = [];

  constructor( private searchService: SearchService, private filterService: FilterService) {
  }

  getFilters() {
    // Get Data and subscribe to url query parameters
    this.filterSub = this.filterService.filters.subscribe(filter => {
      this.filter = filter;

      // Check if any filters are selected
      Object.keys(this.filter).forEach(key => this.filtersOn = this.filter[key].length > 0 || this.filtersOn);

      // Get data
      this.getPersonData();
    });
  }

  ngOnInit() {
    this.getFilters();
  }

  // Get funding data, check if filtered or all data
  getPersonData() {
    // Get data
    this.searchService.getData()
    .pipe(map(personData => [personData]))
    .subscribe(personData => this.personData = personData,
               error => this.errorMessage = error as any);
  }

  ngOnDestroy() {
    this.filterSub.unsubscribe();
  }

}
