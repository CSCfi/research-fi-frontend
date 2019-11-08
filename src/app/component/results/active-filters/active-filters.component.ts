//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, OnDestroy, AfterContentInit } from '@angular/core';
import { Router } from '@angular/router';
import { SortService } from '../../../services/sort.service';
import { FilterService } from '../../../services/filter.service';
import { DataService } from '../../../services/data.service';

@Component({
  selector: 'app-active-filters',
  templateUrl: './active-filters.component.html',
  styleUrls: ['./active-filters.component.scss']
})
export class ActiveFiltersComponent implements OnInit, OnDestroy, AfterContentInit {
  queryParams: any;
  activeFilters = [];

  translations = {
    onGoing: 'Käynnissä',
    ended: 'Päättynyt',
    true: 'Kansainvälinen yhteisjulkaisu',
    noaccessinfo: 'Ei tietoa',
    openAccess: 'Open access',
    hybridAccess: 'Hybridijulkaisu',
    3: 'Korkein taso',
    2: 'Johtava taso',
    1: 'Perustaso',
    0: 'Muut',
    noVal: 'Ei arviota',
    over100k: 'Rahoitus yli 100 000€',
    under100k: 'Rahoitus alle 100 000€'
  };
  filterResponse: any;
  response: any;

  constructor( private router: Router, private sortService: SortService,
               private filterService: FilterService, private dataService: DataService ) {
   }

  ngOnInit() {

  }

  ngAfterContentInit() {
    this.queryParams = this.filterService.filters.subscribe(filter => {
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

      // Subscribe to aggregation data
      this.filterResponse = this.dataService.currentResponse.subscribe(response => this.response = response);

      // ToDo: Could it be possible to get data by category & aggreagation dynamically?
      // Replace values with translated ones
      this.activeFilters.forEach(val => {
        if (val.category === 'lang') {
          const result = this.response[0].aggregations.languageCode.buckets.find(({ key }) => key === val.value);
          const foundIndex = this.activeFilters.findIndex(x => x.value === val.value);
          this.activeFilters[foundIndex].translation = result.language.buckets[0].key;
        }
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

    this.router.navigate([], {queryParams: params});
  }

  clearFilters() {
    this.activeFilters = [];
    this.router.navigate([]);
  }

  ngOnDestroy() {
    this.queryParams.unsubscribe();
    this.filterResponse.unsubscribe();
  }

}
