//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isArray } from 'util';
import { SearchService } from '../../../services/search.service';

@Component({
  selector: 'app-active-filters',
  templateUrl: './active-filters.component.html',
  styleUrls: ['./active-filters.component.scss']
})
export class ActiveFiltersComponent implements OnInit, OnDestroy {
  queryParams: any;
  filter: any;
  activeFilters: any [];
  year: any;
  status: any;
  combinedFilters: any;
  field: any;
  currentTab: string;
  filterParams: any;

  constructor( private route: ActivatedRoute, private router: Router, private searchService: SearchService ) {
    this.filter = [];
   }

  ngOnInit() {
    this.currentTab = this.searchService.currentTab;

    this.queryParams = this.route.queryParams.subscribe(params => {
      this.filter = [params.year, params.status, params.field];
      this.year = params.year;
      this.status = params.status;
      this.field = params.field;
      // console.log(this.filter);

      // If single filter, modify to array
      if (!isArray(this.year)) {this.year = [params.year]; }
      if (!isArray(this.status)) {this.status = [params.status]; }
      if (!isArray(this.field)) {this.field = [params.field]; }

      // Merge arrays
      this.combinedFilters = this.year.concat(this.status, this.field);
      if (!isArray(this.combinedFilters)) {this.combinedFilters = [this.combinedFilters]; }

      // Sort active filters by numerical value
      this.activeFilters = this.combinedFilters.sort((a, b) => b - a);
    });
  }

  removeFilter(event): void {
    const yearParams = this.year.filter(e => e !== event.target.id);
    const statusParams = this.status.filter(e => e !== event.target.id);
    const fieldParams = this.field.filter(e => e !== event.target.id);

    // Remove filters according to tab
    switch (this.currentTab) {
      case 'publications': {
        this.filterParams = {queryParams: {year: yearParams, field: fieldParams}, queryParamsHandling: 'merge' };
        break;
      }
      case 'fundings': {
        this.filterParams = {queryParams: {status: statusParams, year: yearParams} };
        break;
      }
    }

    this.router.navigate([],this.filterParams);
  }

  ngOnDestroy() {
    this.queryParams.unsubscribe();
  }

}
