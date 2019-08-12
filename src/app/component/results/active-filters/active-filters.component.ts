//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isArray } from 'util';
import { SortService } from '../../../services/sort.service';
import { FilterService } from 'src/app/services/filter.service';

@Component({
  selector: 'app-active-filters',
  templateUrl: './active-filters.component.html',
  styleUrls: ['./active-filters.component.scss']
})
export class ActiveFiltersComponent implements OnInit, OnDestroy {
  queryParams: any;
  filter: any;
  activeFilters = [];
  combinedFilters = [];
  currentTab: string;
  filterParams: any;

  constructor( private route: ActivatedRoute, private router: Router, private sortService: SortService,
               private filterService: FilterService ) {
    this.filter = [];
   }

  ngOnInit() {
    this.currentTab = this.sortService.currentTab;

    this.queryParams = this.filterService.filters.subscribe(filter => {
      this.filter = filter;

      // Merge arrays
      this.combinedFilters = [];
      Object.keys(filter).forEach(x => this.combinedFilters.push(filter[x]));
      this.combinedFilters = this.combinedFilters.flat();

      // Translate filter names
      const onGoing = this.combinedFilters.indexOf('onGoing');
      const ended = this.combinedFilters.indexOf('ended');
      if (onGoing !== -1) {this.combinedFilters[onGoing] = 'Käynnissä'; }
      if (ended !== -1) {this.combinedFilters[ended] = 'Päättynyt'; }

      // Sort active filters by numerical value
      this.activeFilters = this.combinedFilters.sort((a, b) => b - a);
      console.log(this.activeFilters);
    });
  }

  removeFilter(event): void {
    const yearParams = this.filter.year.filter(e => e !== event.target.id);
    const statusParams = this.filter.status.filter(e => e !== event.target.id);
    const fieldParams = this.filter.field.filter(e => e !== event.target.id);

    this.combinedFilters = [yearParams, statusParams, fieldParams].flat();

    // Remove filters according to tab
    switch (this.currentTab) {
      case 'publications': {
        this.filterParams = {queryParams: {year: yearParams, field: fieldParams}, queryParamsHandling: 'merge' };
        break;
      }
      case 'fundings': {
        this.filterParams = {queryParams: {status: statusParams, year: yearParams}, queryParamsHandling: 'merge' };
        break;
      }
    }

    this.router.navigate([], this.filterParams);
  }

  ngOnDestroy() {
    this.queryParams.unsubscribe();
  }

}
