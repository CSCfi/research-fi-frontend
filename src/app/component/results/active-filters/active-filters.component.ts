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

  constructor( private route: ActivatedRoute, private router: Router ) {
    this.filter = [];
   }

  ngOnInit() {
    this.queryParams = this.route.queryParams.subscribe(params => {
      this.filter = params.filter;
      if (this.filter === undefined) {this.filter = []; }
      if (isArray(this.filter)) {} else {this.filter = [params.filter]; }
      if (this.filter.length > 0) {this.activeFilters = this.filter.sort((a, b) => b - a); }
    });
  }

  removeFilter(event): void {
    const filterParams = this.filter.filter(e => e !== event.target.id);

    this.router.navigate([], {
      queryParams: {
        filter: filterParams,
      },
      queryParamsHandling: 'merge'
    });
  }

  ngOnDestroy() {
    this.queryParams.unsubscribe();
  }

}
