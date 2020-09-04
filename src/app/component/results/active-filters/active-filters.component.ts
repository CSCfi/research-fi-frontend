//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, OnDestroy, AfterContentInit, ViewChild, ElementRef, AfterViewInit, ViewChildren, QueryList, Input, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { SortService } from '../../../services/sort.service';
import { FilterService } from '../../../services/filter.service';
import { DataService } from '../../../services/data.service';
import { TabChangeService } from '../../../services/tab-change.service';
import { faExclamationTriangle, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FilterListComponent} from './filter-list/filter-list.component';
import { PublicationFilters } from '../filters/publications';
import { PersonFilters } from '../filters/persons';
import { FundingFilters } from '../filters/fundings';
import { InfrastructureFilters } from '../filters/infrastructures';
import { OrganizationFilters } from '../filters/organizations';
import { SettingsService } from 'src/app/services/settings.service';
import { NewsFilters } from '../filters/news';
import { SearchService } from 'src/app/services/search.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-active-filters',
  templateUrl: './active-filters.component.html',
  styleUrls: ['./active-filters.component.scss']
})
export class ActiveFiltersComponent implements OnInit, OnDestroy, AfterContentInit, AfterViewInit {
  queryParams: any;
  activeFilters = [];

  translations = {
    true: $localize`:@@intCoPublication:Kansainvälinen yhteisjulkaisu`,
    noAccessInfo: $localize`:@@noInfo:Ei tietoa`,
    openAccess: $localize`:@@openAccessJournal:Open Access -lehti`,
    nonOpen: $localize`:@@nonOpen:Ei avoin`,
    noVal: $localize`:@@noRating:Ei arviota`,
    otherOpen: $localize`:@@otherOpenAccess:Muu avoin saatavuus`,
    noOpenAccessData: $localize`:@@noInfo:Ei tietoa`,
    selfArchived: $localize`:@@selfArchived:Rinnakkaistallennettu`,
    undefined: $localize`:@@notKnown:Ei tiedossa`,
  };
  filterResponse: any;
  tabFilters: any;
  response: any;
  tabSub: any;
  currentTab: any;
  faExclamationTriangle = faExclamationTriangle;
  faTrashAlt = faTrashAlt;
  hoverIndex: any;
  fromYear: number;
  toYear: number;

  filterListDialogRef: MatDialogRef<FilterListComponent>;
  translationFlag: boolean;
  parsedFilters: any[];
  @ViewChildren('container') container: QueryList<ElementRef>;
  containerSub: any;
  yearRange: string;
  isBrowser: any;
  filterValues: import("d:/Code/research-fi-frontend/src/app/models/search.model").Search[];
  errorMessage: any;

  constructor( private router: Router, private sortService: SortService, private filterService: FilterService,
               private dataService: DataService, private tabChangeService: TabChangeService,
               public dialog: MatDialog, private publicationFilters: PublicationFilters, private personFilters: PersonFilters,
               private fundingFilters: FundingFilters, private infrastructureFilters: InfrastructureFilters,
               private organizationFilters: OrganizationFilters, private newsFilters: NewsFilters,
               private settingsService: SettingsService, @Inject(PLATFORM_ID) private platformId: object,
               private searchService: SearchService ) {
                this.isBrowser = isPlatformBrowser(this.platformId);
   }

  ngOnInit() {
    this.currentTab = this.sortService.currentTab;
    switch (this.currentTab) {
      case 'publications':
        this.tabFilters = this.publicationFilters.filterData;
        this.yearRange = $localize`:@@yearOfPublication:Julkaisuvuosi` + ': ';
        break;
      case 'fundings':
        this.tabFilters = this.fundingFilters.filterData;
        this.yearRange = $localize`:@@startYear:Aloitusvuosi` + ': ';
        break;
      case 'infrastructures':
        this.tabFilters = this.infrastructureFilters.filterData;
        this.yearRange = $localize`:@@startYear:Aloitusvuosi` + ': ';
        break;
      case 'persons':
        this.tabFilters = this.personFilters.filterData;
        break;
      case 'organizations':
        this.tabFilters = this.organizationFilters.filterData;
        break;
      case 'news':
        this.tabFilters = this.newsFilters.filterData;
        break;

      default:
        break;
    }
  }

  ngAfterContentInit() {
    this.translate();
  }

  ngAfterViewInit() {
    // Get height of component and send to service, this is used with result header top margin
    this.containerSub = this.container.changes.subscribe(item => {
      const arr = item.toArray();
      this.dataService.changeActiveFilterHeight(arr[0]?.nativeElement.offsetHeight);
    });
  }

  translate() {
    this.translationFlag = false;
    this.queryParams = this.filterService.filters.subscribe(filter => {
      // Get from & to year values from filter list
      this.fromYear = parseInt(filter.fromYear[0]?.slice(1), 10);
      this.toYear = parseInt(filter.toYear[0]?.slice(1), 10);
      const years = filter.year.map(item => parseInt(item, 10));
      let yearWarning = false;

      if (this.fromYear && this.toYear) {
        // Check if years missing between range and add warning flag
        if (filter.year.filter(item => (this.fromYear <= item && item <= this.toYear)).length !== this.toYear - this.fromYear + 1) {
          yearWarning = true;
        }
      } else if (this.fromYear) {
          if (filter.year.filter(item => (this.fromYear <= item)).length !== Math.max(...years) - this.fromYear + 1) {
            yearWarning = true;
          }
      } else if (this.toYear) {
        if (filter.year.filter(item => (this.toYear >= item)).length !== (this.toYear + 1) - Math.min(...years)) {
          yearWarning = true;
        }
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
      this.filterResponse = this.searchService.getAllFilters().subscribe(response => {
        this.response = response;
        if (response) {
          const source = this.response.aggregations;
          const tab = this.sortService.currentTab;
          // Replace values with translated ones
          this.activeFilters.forEach(val => {
            // Active year filters can be displayed with range. Hide items that are within the range
            if (val.category === 'fromYear') {
              if (this.fromYear && this.toYear) {
                // Set range and warning if values missing between range
                val.translation = this.yearRange + this.fromYear + ' - ' + this.toYear;
                val.warning = yearWarning ? true : false;
              } else if (this.fromYear) {
                val.translation = this.yearRange + this.fromYear + $localize`:@@yearFrom: alkaen`;
                val.warning = yearWarning ? true : false;
              }
            }

            if (val.category === 'toYear') {
              val.translation = this.yearRange + this.toYear + $localize`:@@yearTo: päättyen`;
              val.warning = yearWarning ? true : false;
              if (this.fromYear && this.toYear) {
                val.hide = true;
              }
            }

            if (val.category === 'year') {
              if (this.fromYear && this.toYear) {
                if (val.value >= this.fromYear && val.value <= this.toYear) {
                  val.hide = true;
                }
              } else if (this.fromYear) {
                if (val.value >= this.fromYear) {
                  val.hide = true;
                }
              } else if (this.toYear) {
                if (val.value <= this.toYear) {
                  val.hide = true;
                }
              }
            }

            // Field of science
            if (val.category === 'field' && source.field?.fields) {
              const result = source.field.fields.buckets.find(key => parseInt(key.fieldId.buckets[0].key, 10) === parseInt(val.value, 10));
              const foundIndex = this.activeFilters.findIndex(x => x.value === val.value);
              this.activeFilters[foundIndex].translation = result?.key ? result.key : '';
            }
            // Language, publications
            if (val.category === 'lang' && source.lang?.langs) {
              const result = source.lang.langs.buckets.find(({ key }) => key.toLowerCase() === val.value);
              const foundIndex = this.activeFilters.findIndex(x => x.value === val.value);
              this.activeFilters[foundIndex].translation = result.language ? result.language.buckets[0].key : '';
            }

            if (val.category === 'sector' && tab === 'organizations' && source.sector) {
              if (source.sector.buckets?.length > 0  && !source.sector.sectorName) {
                source.sector.buckets.forEach(element => {
                  if (element.sectorId && element.sectorId.buckets[0].key === val.value) {
                    const foundIndex = this.activeFilters.findIndex(x => x.value === val.value);
                    this.activeFilters[foundIndex].translation = element.key;
                  }
                });
              }
            }
            // Organization
            if (val.category === 'organization' && source.organization) {
              // Publication organization name
              if (tab === 'publications') {
                // There is some latency, timeout fixes missing translations
                if (source.organization.sectorName && source.organization.sectorName.buckets.length > 0) {
                  source.organization.sectorName.buckets.forEach(sector => {
                    setTimeout(t => {
                      if (sector.org.org.buckets.find(x => x.key === val.value)) {
                        const foundIndex = this.activeFilters.findIndex(x => x.value === val.value);
                        this.activeFilters[foundIndex].translation =
                        sector.org.org.buckets.find(x => x.key === val.value).label.trim();
                      }
                    }, 1);
                  });
                }
                // Funding organization name
              } else if (tab === 'fundings') {
                setTimeout(t => {
                  if (source.organization.buckets) {
                    source.organization.buckets.forEach(sector => {
                      if (sector.organizations.buckets.find(x => x.key === val.value)) {
                        const foundIndex = this.activeFilters.findIndex(x => x.value === val.value);
                        this.activeFilters[foundIndex].translation =
                        sector.organizations.buckets.find(x => x.key === val.value).label.trim();
                      }
                    });
                  }
                }, 1);
                // Infrastructure organization name
              } else if (tab === 'infrastructures') {
                if (source.organization?.sector?.buckets?.length > 0) {
                  source.organization.sector.buckets.forEach(sector => {
                    sector.organizations.buckets.forEach(org => {
                      if (org.organizationId.buckets[0]?.key === val.value) {
                        const foundIndex = this.activeFilters.findIndex(x => x.value === val.value);
                        this.activeFilters[foundIndex].translation = org.key?.trim();
                      }
                    });
                  });
                }
              } else if (tab === 'organizations') {
                if (source.organization?.organizationName?.buckets?.length > 0) {
                  source.organization.organizationName.buckets.forEach(org => {
                    if (org.organizationId.buckets[0]?.key === val.value) {
                      const foundIndex = this.activeFilters.findIndex(x => x.value === val.value);
                      this.activeFilters[foundIndex].translation = org.key?.trim();
                    }
                  });
                }
              }
            }

            // Country code
            if (val.category === 'countryCode' && source.countryCode) {
              switch (val.value) {
                case 'c0': {
                  val.translation = $localize`:@@publicationCountry:Julkaisumaa` + ': ' + $localize`:@@finland:Suomi`;
                  break;
                }
                case 'c1': {
                  val.translation = $localize`:@@publicationCountry:Julkaisumaa` + ': ' + $localize`:@@other:Muut`;
                  break;
                }
              }
            }
            // JuFo code
            if (val.category === 'juFo' && source.juFo) {
              switch (val.value) {
                case 'j3': {
                  val.translation = $localize`:@@jufoLevel:Julkaisufoorumitaso` + ': 3';
                  break;
                }
                case 'j2': {
                  val.translation = $localize`:@@jufoLevel:Julkaisufoorumitaso` + ': 2';
                  break;
                }
                case 'j1': {
                  val.translation = $localize`:@@jufoLevel:Julkaisufoorumitaso` + ': 1';
                  break;
                }
                case 'j0': {
                  val.translation = $localize`:@@jufoLevel:Julkaisufoorumitaso` + ': 0';
                  break;
                }
              }
            }
            // Funding
            // Type of funding
            if (val.category === 'typeOfFunding' && source.typeOfFunding) {
              if (source.typeOfFunding.types.buckets?.length > 0) {
                source.typeOfFunding.types.buckets.forEach(type => {
                  setTimeout(t => {
                    if (type.subData.find(x => x.key === val.value)) {
                      const foundIndex = this.activeFilters.findIndex(x => x.value === val.value);
                      this.activeFilters[foundIndex].translation = type.subData.find(x => x.key === val.value).label;
                    }
                  }, 1);
                });
              }
            }

            // Funder
            if (val.category === 'funder' && source.funder) {
              setTimeout(t => {
                const result = source.funder.funders.buckets.find(({ key }) => key === val.value);
                const foundIndex = this.activeFilters.findIndex(x => x.value === val.value);
                this.activeFilters[foundIndex].translation = result.label ? result.label : '';
              }, 1);
            }

            // Infrastructures
            // Type
            if (val.category === 'type' && source.type) {
              // Hotfix for type translation. Type is translated in filters / infrastructures via localize method.
              // This might cause some latency and therefore timeout is needed.
              setTimeout(t => {
                const result = source.type.types.buckets.find(({ key }) => key === val.value);
                const foundIndex = this.activeFilters.findIndex(x => x.value === val.value);
                this.activeFilters[foundIndex].translation = result.label ? result.label : '';
              }, 1);
            }

            // Infrastructure main field of science
            if (tab === 'infrastructures' && val.category === 'field') {
              setTimeout(t => {
                const result = source.field.buckets.find(key => key.key === val.value);
                const foundIndex = this.activeFilters.findIndex(x => x.value === val.value);
                this.activeFilters[foundIndex].translation = result.label ? result.label : '';
              }, 1);
            }

            // Organization, sector
            if (val.category === 'sector' && source.sector) {
              const result = source.sector.sectorId.buckets.find(({ key }) => key === val.value);
              const foundIndex = this.activeFilters.findIndex(x => x.value === val.value);
              this.activeFilters[foundIndex].translation = result.sectorName ? result.sectorName.buckets[0].key : '';
            }

            // News, organization
            if (tab === 'news' && source.organization) {
              setTimeout(t => {
                if (source.organization.buckets) {
                  source.organization.buckets.forEach(sector => {
                    if (sector.orgName.buckets.find(x => x.key === val.value)) {
                      const foundIndex = this.activeFilters.findIndex(x => x.value === val.value);
                      this.activeFilters[foundIndex].translation =
                      sector.orgName.buckets.find(x => x.key === val.value).label.trim();
                    }
                  });
                }
              }, 1);
            }
          });
          // Set flag when all filters are translated & filter items that aren't hidden
          this.translationFlag = true;
          if (this.translationFlag === true) {
            this.parsedFilters = this.activeFilters.filter(item => !item.hide);

          }
        }
      });
      // Sort active filters by numerical value
      this.activeFilters = this.activeFilters.sort((a, b) => b.translation - a.translation);
    });
  }

  removeFilter(event): void {
    // Remove range filters. Check that target active filter matches fromYear filter
    if (event.target.id.length === 5 && event.target.id.slice(0, 1) === 'f') {
      if (this.fromYear && this.toYear) {
        this.activeFilters = this.activeFilters.filter(elem => elem.category !== 'fromYear');
        this.activeFilters = this.activeFilters.filter(elem => elem.category !== 'toYear');
        this.activeFilters = this.activeFilters.filter(
          elem => !(this.fromYear <= parseInt(elem.value, 10) && parseInt(elem.value, 10) <= this.toYear));
      } else if (this.fromYear) {
        this.activeFilters = this.activeFilters.filter(elem => elem.category !== 'fromYear');
        this.activeFilters = this.activeFilters.filter(
          elem => !(this.fromYear <= parseInt(elem.value, 10)));
      } else if (this.toYear) {
        this.activeFilters = this.activeFilters.filter(elem => elem.category !== 'toYear');
        this.activeFilters = this.activeFilters.filter(
          elem => !(this.toYear >= parseInt(elem.value, 10)));
      }
    }

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
    // Preserve target if available
    this.router.navigate([], {queryParams: {target: this.settingsService.target}});
  }

  ngOnDestroy() {
    this.queryParams?.unsubscribe();
    this.filterResponse?.unsubscribe();
    // this.tabSub?.unsubscribe();
    this.containerSub?.unsubscribe();
  }

  // Set index for warning hover
  enter(index) {
    this.hoverIndex = index;
  }

  leave() {
    this.hoverIndex = null;
  }

  openModal() {
    this.filterListDialogRef = this.dialog.open(FilterListComponent, {
      maxWidth: '60vw',
      minWidth: '400px',
      data: {
        active: this.activeFilters,
        fromYear: this.fromYear,
        toYear: this.toYear,
        tabFilters: this.tabFilters
      }
    });
  }

}
