//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SortService } from '../../../services/sort.service';
import { FilterService } from 'src/app/services/filter.service';

@Component({
  selector: 'app-active-filters',
  templateUrl: './active-filters.component.html',
  styleUrls: ['./active-filters.component.scss']
})
export class ActiveFiltersComponent implements OnInit, OnDestroy {
  queryParams: any;
  activeFilters = [];

  translations = {
    onGoing: 'Käynnissä',
    ended: 'Päättynyt'
  };

  constructor( private route: ActivatedRoute, private router: Router, private sortService: SortService,
               private filterService: FilterService ) {
   }

  ngOnInit() {

    this.queryParams = this.filterService.filters.subscribe(filter => {
      console.log('activeFilter filterSub', filter);

      // Reset active filter so push doesn't duplicate
      this.activeFilters = [];
      const newFilters = {};
      // Merge and format arrays
      Object.keys(filter).forEach(key => {
        newFilters[key] = filter[key].map(val => {
          return {category: key, value: val, translation: this.translations[val] || val};
        });
        this.activeFilters.push(...newFilters[key]);
      });

      // Sort active filters by numerical value
      this.activeFilters = this.activeFilters.sort((a, b) => b.translation - a.translation);
    });
  }

  removeFilter(event): void {

    this.activeFilters = this.activeFilters.filter(elem => elem.value !== event.target.id);

    const params = this.activeFilters.reduce((storage, item) => {
      // get the first instance of the category
      const group = item.category;

      // set storage or initialize it
      storage[group] = storage[group] || [];

      // add the current item to storage
      storage[group].push(item.value);

      // return the updated storage to the next iteration
      return storage;
    }, {});  // initially empty object {} as storage

    params.sort = this.sortService.sortMethod;
    console.log('activeFilter params', params);

    this.router.navigate([], {queryParams: params});
  }

  ngOnDestroy() {
    this.queryParams.unsubscribe();
  }

}
