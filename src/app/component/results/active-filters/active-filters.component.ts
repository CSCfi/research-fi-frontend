//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isArray, isString } from 'util';

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

  constructor( private route: ActivatedRoute, private router: Router ) {
    this.filter = [];
   }

  ngOnInit() {
    this.queryParams = this.route.queryParams.subscribe(params => {
      this.filter = [params.year, params.status];
      this.year = params.year;
      this.status = params.status;

      // If single filter, modify to array
      if (!isArray(this.year)) {this.year = [params.year]; }
      if (!isArray(this.status)) {this.status = [params.status]; }

      // Merge arrays
      this.combinedFilters = this.year.concat(this.status);
      if (!isArray(this.combinedFilters)) {this.combinedFilters = [this.combinedFilters]; }

      // Sort active filters by numerical value
      this.activeFilters = this.combinedFilters.sort((a, b) => b - a);
    });
  }

  removeFilter(event): void {
    const yearParams = this.year.filter(e => e !== event.target.id);
    let statusParams = this.status.filter(e => e !== event.target.id);

    // Handle undefined filters
    if (statusParams) {statusParams = []; }

    this.router.navigate([], {
      queryParams: {
        year: yearParams,
        status: statusParams,
      },
      queryParamsHandling: 'merge'
    });
  }

  ngOnDestroy() {
    this.queryParams.unsubscribe();
  }

}
