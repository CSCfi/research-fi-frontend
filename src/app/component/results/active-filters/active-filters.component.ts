//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, OnDestroy, AfterContentInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { SortService } from '../../../services/sort.service';
import { FilterService } from '../../../services/filter.service';
import { DataService } from '../../../services/data.service';
import { TabChangeService } from '../../../services/tab-change.service';
import { switchMapTo } from 'rxjs/operators';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

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
    noAccessInfo: 'Ei tietoa',
    openAccess: 'Avoin saatavuus',
    nonOpen: 'Ei avoin',
    noVal: 'Ei arviota',
    noOpenAccessData: 'Ei tietoa',
    selfArchived: 'Rinnakkaistallennettu',
    undefined: 'Ei tiedossa',
    over100k: 'Rahoitus yli 100 000€',
    under100k: 'Rahoitus alle 100 000€'
  };
  filterResponse: any;
  response: any;
  tabSub: any;
  currentTab: any;
  faExclamationTriangle = faExclamationTriangle;
  hoverIndex: any;

  constructor( private router: Router, private sortService: SortService, private filterService: FilterService,
               private dataService: DataService, private tabChangeService: TabChangeService ) {
   }

  ngOnInit() {
    this.tabSub = this.tabChangeService.currentTab.subscribe(tab => this.currentTab = tab);
  }

  ngAfterContentInit() {
    this.translate();
  }

  translate() {
    this.queryParams = this.filterService.filters.subscribe(filter => {
      // Get from & to year values from filter list, remove years that are between this range. If range is available,
      // remove fromYear from array. We translate toYear to hold both range ends.
      const fromYear = parseInt(filter.fromYear[0]?.slice(1), 10);
      const toYear = parseInt(filter.toYear[0]?.slice(1), 10);
      let yearWarning = false;
      if (fromYear && toYear) {
        // Check if years missing between range and add warning flag
        if ((toYear - fromYear + 1) !== filter.year.filter(item => parseInt(item, 10) >= fromYear && parseInt(item, 10) <= toYear).length) {
          yearWarning = true;
        }

        filter.year = filter.year.filter(item => parseInt(item, 10) < fromYear || parseInt(item, 10) > toYear);
        filter.toYear = filter.toYear.filter(item => item === undefined);
      } else if (fromYear) {
        filter.year = filter.year.filter(item => parseInt(item, 10) < fromYear);
      } else if (toYear) {
        filter.year = filter.year.filter(item => parseInt(item, 10) > toYear);
      }

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
      this.filterResponse = this.dataService.currentResponse.subscribe(response => {
        this.response = response;
        if (response) {
          const source = this.response[0].aggregations;
          const tab = this.currentTab.data;
          // Replace values with translated ones
          this.activeFilters.forEach(val => {
            if (val.category === 'fromYear') {
              if (fromYear && toYear) {
                // Set range and warning if values missing between range
                val.translation = 'Julkaisuvuosi: ' + fromYear + ' - ' + toYear;
                val.warning = yearWarning ? true : false;
              } else if (fromYear) {
                val.translation = 'Julkaisuvuosi: ' + fromYear + ' alkaen';
              }
            }

            if (val.category === 'toYear') {
              val.translation = 'Julkaisuvuosi: ' + toYear + ' päättyen';
            }

            if (val.category === 'lang' && source.lang.sum_other_doc_count > 0) {
              const result = source.lang.buckets.find(({ key }) => key === val.value);
              const foundIndex = this.activeFilters.findIndex(x => x.value === val.value);
              this.activeFilters[foundIndex].translation = result.language ? result.language.buckets[0].key : '';
            }

            if (val.category === 'sector' && tab === 'organizations' && source.sector) {
              if (source.sector.buckets.length > 0  && !source.sector.sectorName) {
                source.sector.buckets.forEach(element => {
                  if (element.sectorId && element.sectorId.buckets[0].key === val.value) {
                    const foundIndex = this.activeFilters.findIndex(x => x.value === val.value);
                    this.activeFilters[foundIndex].translation = element.key;
                  }
                });
              }
            }

            // Organization name
            if (val.category === 'organization' && source.organization) {
              if (source.organization.sectorName && source.organization.sectorName.buckets.length > 0) {
                source.organization.sectorName.buckets.forEach(sector => {
                  sector.organizations.buckets.forEach(org => {
                    if (org.orgId.buckets[0].key === val.value) {
                      const foundIndex = this.activeFilters.findIndex(x => x.value === val.value);
                      this.activeFilters[foundIndex].translation = org.key.trim();
                    }
                  });
                });
              }
            }
            // Country code
            if (val.category === 'countryCode' && source.countryCode) {
              switch (val.value) {
                case 'c0': {
                  val.translation = 'Julkaisumaa: Suomi';
                  break;
                }
                case 'c1': {
                  val.translation = 'Julkaisumaa: Muut';
                  break;
                }
              }
            }
            // JuFo code
            if (val.category === 'juFo' && source.juFo) {
              switch (val.value) {
                case 'j3': {
                  val.translation = 'Julkaisufoorumitaso: 3';
                  break;
                }
                case 'j2': {
                  val.translation = 'Julkaisufoorumitaso: 2';
                  break;
                }
                case 'j1': {
                  val.translation = 'Julkaisufoorumitaso: 1';
                  break;
                }
                case 'j0': {
                  val.translation = 'Julkaisufoorumitaso: 0';
                  break;
                }
              }
            }
            // Funding
            // Type of funding
            if (val.category === 'typeOfFunding' && source.typeOfFunding) {
              const result = source.typeOfFunding.buckets.find(({ key }) => key === val.value);
              const foundIndex = this.activeFilters.findIndex(x => x.value === val.value);
              this.activeFilters[foundIndex].translation = result.typeName ? result.typeName.buckets[0].key : '';
            }
          });
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
    this.tabSub.unsubscribe();
  }

  // Set index for warning hover
  enter(index) {
    this.hoverIndex = index;
  }

  leave() {
    this.hoverIndex = null;
}

}
