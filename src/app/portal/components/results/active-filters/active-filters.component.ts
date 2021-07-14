//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import {
  Component,
  OnInit,
  OnDestroy,
  AfterContentInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  ViewChildren,
  QueryList,
  Input,
  Inject,
  PLATFORM_ID,
  LOCALE_ID,
} from '@angular/core';
import { Router } from '@angular/router';
import { SortService } from '../../../services/sort.service';
import { FilterService } from '../../../services/filters/filter.service';
import { DataService } from '../../../services/data.service';
import { TabChangeService } from '../../../services/tab-change.service';
import {
  faExclamationTriangle,
  faTrashAlt,
} from '@fortawesome/free-solid-svg-icons';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FilterListComponent } from './filter-list/filter-list.component';
import { PublicationFilterService } from 'src/app/portal/services/filters/publication-filter.service';
import { PersonFilterService } from 'src/app/portal/services/filters/person-filter.service';
import { FundingFilterService } from 'src/app/portal/services/filters/funding-filter.service';
import { DatasetFilterService } from 'src/app/portal/services/filters/dataset-filter.service';
import { InfrastructureFilterService } from 'src/app/portal/services/filters/infrastructure-filter.service';
import { OrganizationFilterService } from 'src/app/portal/services/filters/organization-filter.service';
import { SettingsService } from 'src/app/portal/services/settings.service';
import { NewsFilterService } from 'src/app/portal/services/filters/news-filter.service';
import { SearchService } from 'src/app/portal/services/search.service';
import { isPlatformBrowser } from '@angular/common';
import { FundingCallFilterService } from '@portal/services/filters/funding-call-filter.service';

@Component({
  selector: 'app-active-filters',
  templateUrl: './active-filters.component.html',
  styleUrls: ['./active-filters.component.scss'],
})
export class ActiveFiltersComponent
  implements OnInit, OnDestroy, AfterContentInit, AfterViewInit {
  queryParams: any;
  activeFilters = [];

  translations = {
    noAccessInfo: $localize`:@@noInfo:Ei tietoa`,
    openAccess: $localize`:@@openAccessJournal:Open Access -lehti`,
    nonOpen: $localize`:@@nonOpen:Ei avoin`,
    noVal: $localize`:@@noRating:Ei arviota`,
    otherOpen: $localize`:@@otherOpenAccess:Muu avoin saatavuus`,
    noOpenAccessData: $localize`:@@noInfo:Ei tietoa`,
    selfArchived: $localize`:@@selfArchived:Rinnakkaistallennettu`,
    undefined: $localize`:@@notKnown:Ei tiedossa`,
    // Dataset access types
    open: $localize`:@@datasetAccessOpen:Avoin`,
    permit: $localize`:@@datasetAccessPermit:Vaatii luvan hakemista Fairdata-palvelussa`,
    login: $localize`:@@datasetAccessLogin:Vaatii kirjautumisen Fairdata-palvelussa`,
    restricted: $localize`:@@datasetAccessRestricted:Saatavuutta rajoitettu`,
    embargo: $localize`:@@datasetAccessEmbargo:Embargo`,
    // Funding-call status
    closed: $localize`:@@closedCalls:Menneet haut`,
    future: $localize`:@@futureCalls:Tulevat haut`,
    continuous: $localize`:@@continuousCalls:Jatkuvat haut`,
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
  errorMessage: any;

  constructor(
    private router: Router,
    private sortService: SortService,
    private filterService: FilterService,
    private dataService: DataService,
    private tabChangeService: TabChangeService,
    public dialog: MatDialog,
    private publicationFilters: PublicationFilterService,
    private personFilters: PersonFilterService,
    private fundingFilters: FundingFilterService,
    private datasetFilters: DatasetFilterService,
    private infrastructureFilters: InfrastructureFilterService,
    private organizationFilters: OrganizationFilterService,
    private fundingCallFilters: FundingCallFilterService,
    private newsFilters: NewsFilterService,
    private settingsService: SettingsService,
    @Inject(PLATFORM_ID) private platformId: object,
    @Inject(LOCALE_ID) protected localeId: string,
    private searchService: SearchService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    this.currentTab = this.tabChangeService.tab;
    switch (this.currentTab) {
      case 'publications':
        this.tabFilters = this.publicationFilters.filterData;
        this.yearRange = $localize`:@@yearOfPublication:Julkaisuvuosi` + ': ';
        break;
      case 'fundings':
        this.tabFilters = this.fundingFilters.filterData;
        this.yearRange = $localize`:@@startYear:Aloitusvuosi` + ': ';
        break;
      case 'datasets':
        this.tabFilters = this.datasetFilters.filterData;
        this.yearRange = $localize`:@@yearOfPublication:Julkaisuvuosi` + ': ';
        break;
      case 'infrastructures':
        this.tabFilters = this.infrastructureFilters.filterData;
        this.yearRange = $localize`:@@startYear:Aloitusvuosi` + ': ';
        break;
      // case 'persons':
      //   this.tabFilters = this.personFilters.filterData;
      //   break;
      case 'organizations':
        this.tabFilters = this.organizationFilters.filterData;
        break;
      case 'funding-calls':
        this.tabFilters = this.fundingCallFilters.filterData;
        this.yearRange = $localize`:@@applicationPeriod:Hakuaika` + ': ';
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
    this.containerSub = this.container.changes.subscribe((item) => {
      const arr = item.toArray();
      this.dataService.changeActiveFilterHeight(
        arr[0]?.nativeElement.offsetHeight
      );
    });
  }

  translate() {
    this.translationFlag = false;
    const errorMsg = 'error translating filter';
    this.queryParams = this.filterService.filters.subscribe((filter) => {
      // Get from & to year values from filter list
      this.fromYear = parseInt(filter.fromYear[0]?.slice(1), 10);
      this.toYear = parseInt(filter.toYear[0]?.slice(1), 10);
      const years = filter.year.map((item) => parseInt(item, 10));
      let yearWarning = false;

      if (this.fromYear && this.toYear) {
        // Check if years missing between range and add warning flag
        if (
          filter.year.filter(
            (item) => this.fromYear <= item && item <= this.toYear
          ).length !==
          this.toYear - this.fromYear + 1
        ) {
          yearWarning = true;
        }
      } else if (this.fromYear) {
        if (
          filter.year.filter((item) => this.fromYear <= item).length !==
          Math.max(...years) - this.fromYear + 1
        ) {
          yearWarning = true;
        }
      } else if (this.toYear) {
        if (
          filter.year.filter((item) => this.toYear >= item).length !==
          this.toYear + 1 - Math.min(...years)
        ) {
          yearWarning = true;
        }
      }

      // Reset active filter so push doesn't duplicate
      this.activeFilters = [];
      const newFilters = {};

      // Merge and format arrays
      Object.keys(filter).forEach((key) => {
        newFilters[key] = filter[key].map((val) => {
          return {
            category: key,
            value: val,
            translation: this.translations[val] || val,
          };
        });
        this.activeFilters.push(...newFilters[key]);
      });
      const tab = this.tabChangeService.tab;

      // Subscribe to aggregation data and shape to get corresponding values
      this.filterResponse = this.searchService
        .getAllFilters(tab)
        .subscribe((response) => {
          switch (tab) {
            case 'publications': {
              this.response = this.publicationFilters.shapeData(response);
              break;
            }
            case 'fundings': {
              this.response = this.fundingFilters.shapeData(response);
              break;
            }
            case 'datasets': {
              this.response = this.datasetFilters.shapeData(response);
              break;
            }
            case 'infrastructures': {
              this.response = this.infrastructureFilters.shapeData(response);
              break;
            }
            case 'organizations': {
              this.response = this.organizationFilters.shapeData(response);
              break;
            }
            case 'funding-calls': {
              this.response = this.fundingCallFilters.shapeData(response);
              break;
            }
            case 'news': {
              this.response = this.newsFilters.shapeData(response);
              break;
            }
          }

          if (response) {
            const source = this.response;
            // Replace values with translated ones
            this.activeFilters.forEach((val) => {
              // Active year filters can be displayed with range. Hide items that are within the range
              if (val.category === 'fromYear') {
                if (this.fromYear && this.toYear) {
                  // Set range and warning if values missing between range
                  val.translation =
                    this.yearRange + this.fromYear + ' - ' + this.toYear;
                  val.warning = yearWarning ? true : false;
                } else if (this.fromYear) {
                  val.translation =
                    this.yearRange +
                    this.fromYear +
                    $localize`:@@yearFrom: alkaen`;
                  val.warning = yearWarning ? true : false;
                }
              }

              if (val.category === 'toYear') {
                val.translation =
                  this.yearRange + this.toYear + $localize`:@@yearTo: päättyen`;
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

              if (val.category === 'date') {
                const dateString = filter.date ? filter.date[0] : ''; 
                const startDate = dateString?.split('|')[0];
                const endDate = dateString?.split('|')[1];
                const startDateString = startDate ? new Date(startDate).toLocaleDateString('fi') : '';
                const endDateString = endDate ? new Date(endDate).toLocaleDateString('fi') : '';
                if (startDateString && endDateString) {
                  val.translation = this.yearRange + startDateString + ' - ' + endDateString;
                } else if (startDateString) {
                  val.translation = this.yearRange + $localize`:@@startsEarliest:Alkaa aikaisintaan` + ' ' + startDateString;  
                } else if (endDateString) {
                  val.translation = this.yearRange + $localize`:@@closesLatest:Päättyy viimeistään` + ' ' + endDateString;
                }
              }

              // Only open status is translated here because it clashes with dataset open filter,
              // others are translated via hardcoding
              if (val.category === 'status' && source.status?.buckets) {
                if (val.value === 'open') {
                  val.translation = $localize`:@@openCalls:Avoimet haut`;
                }
              }

              // Field of science
              if (val.category === 'field' && source.field?.fields) {
                const result = source.field.fields.buckets.find(
                  (key) =>
                    parseInt(key.fieldId.buckets[0].key, 10) ===
                    parseInt(val.value, 10)
                );
                const foundIndex = this.activeFilters.findIndex(
                  (x) => x.value === val.value
                );
                this.activeFilters[foundIndex].translation = result?.key
                  ? result.key
                  : '';
              }

              if (
                val.category === 'publicationFormat' &&
                source.publicationFormat.buckets
              ) {
                const result = source.publicationFormat.buckets.find(
                  (item) => item.key === val.value
                );
                const foundIndex = this.activeFilters.findIndex(
                  (x) =>
                    x.category === 'publicationFormat' && x.value === val.value
                );
                this.activeFilters[foundIndex].translation = result?.label
                  ? result.label
                  : errorMsg;
              }

              if (
                val.category === 'publicationAudience' &&
                source.publicationAudience.buckets
              ) {
                const result = source.publicationAudience.buckets.find(
                  (item) => item.key === val.value
                );
                const foundIndex = this.activeFilters.findIndex(
                  (x) =>
                    x.category === 'publicationAudience' &&
                    x.value === val.value
                );
                this.activeFilters[foundIndex].translation = result?.label
                  ? result.label
                  : errorMsg;
              }

              if (
                val.category === 'parentPublicationType' &&
                source.parentPublicationType.buckets
              ) {
                const result = source.parentPublicationType.buckets.find(
                  (item) => item.key === val.value
                );
                const foundIndex = this.activeFilters.findIndex(
                  (x) =>
                    x.category === 'parentPublicationType' &&
                    x.value === val.value
                );
                this.activeFilters[foundIndex].translation = result?.label
                  ? result.label
                  : errorMsg;
              }

              if (
                val.category === 'peerReviewed' &&
                source.peerReviewed.buckets
              ) {
                const result = source.peerReviewed.buckets.find(
                  (item) => item.key === val.value
                );
                const foundIndex = this.activeFilters.findIndex(
                  (x) => x.category === 'peerReviewed' && x.value === val.value
                );
                this.activeFilters[foundIndex].translation = result?.label
                  ? result.label
                  : errorMsg;
              }

              // Language, publications
              if (val.category === 'lang' && source.lang?.langs) {
                const result = source.lang.langs.buckets.find(
                  ({ key }) => key.toLowerCase() === val.value
                );
                const foundIndex = this.activeFilters.findIndex(
                  (x) => x.value === val.value
                );
                this.activeFilters[foundIndex].translation = result.language
                  ? result.language.buckets[0].key
                  : '';
              }

              if (
                val.category === 'sector' &&
                tab === 'organizations' &&
                source.sector
              ) {
                if (
                  source.sector.buckets?.length > 0 &&
                  !source.sector.sectorName
                ) {
                  source.sector.buckets.forEach((element) => {
                    if (
                      element.sectorId &&
                      element.sectorId.buckets[0].key === val.value
                    ) {
                      const foundIndex = this.activeFilters.findIndex(
                        (x) => x.value === val.value
                      );
                      this.activeFilters[foundIndex].translation = element.key;
                    }
                  });
                }
              }

              if (val.category === 'internationalCollaboration') {
                this.activeFilters.find(
                  (item) => item.category === 'internationalCollaboration'
                ).translation = $localize`:@@intCoPublication:Kansainvälinen yhteisjulkaisu`;
              }

              // Global organization filter
              if (val.category === 'organization' && source.organization) {
                // Publication organization name
                if (tab === 'publications') {
                  setTimeout((t) => {
                    if (source.organization.sectorName.buckets) {
                      source.organization.sectorName.buckets.forEach(
                        (sector) => {
                          if (sector.subData.find((x) => x.key === val.value)) {
                            const foundIndex = this.activeFilters.findIndex(
                              (x) => x.value === val.value
                            );
                            this.activeFilters[
                              foundIndex
                            ].translation = sector.subData
                              .find((x) => x.key === val.value)
                              .label.trim();
                          }
                        }
                      );
                    }
                  }, 1);
                  // Funding organization name
                } else if (tab === 'fundings') {
                  setTimeout((t) => {
                    if (source.organization.funded.sectorName.buckets) {
                      source.organization.funded.sectorName.buckets.forEach(
                        (sector) => {
                          if (sector.subData.find((x) => x.key === val.value)) {
                            const foundIndex = this.activeFilters.findIndex(
                              (x) => x.value === val.value
                            );
                            this.activeFilters[
                              foundIndex
                            ].translation = sector.subData
                              .find((x) => x.key === val.value)
                              .label.trim();
                          }
                        }
                      );
                    }
                  }, 1);
                  // Dataset organization name
                } else if (tab === 'datasets') {
                  setTimeout((t) => {
                    if (source.organization.sectorName.buckets) {
                      source.organization.sectorName.buckets.forEach(
                        (sector) => {
                          if (sector.subData.find((x) => x.key === val.value)) {
                            const foundIndex = this.activeFilters.findIndex(
                              (x) => x.value === val.value
                            );
                            this.activeFilters[
                              foundIndex
                            ].translation = sector.subData
                              .find((x) => x.key === val.value)
                              .label.trim();
                          }
                        }
                      );
                    }
                  }, 1);
                  // Infrastructure organization name
                } else if (tab === 'infrastructures') {
                  setTimeout((t) => {
                    if (source.organization.sector.buckets) {
                      source.organization.sector.buckets.forEach((sector) => {
                        if (sector.subData.find((x) => x.key === val.value)) {
                          const foundIndex = this.activeFilters.findIndex(
                            (x) => x.value === val.value
                          );
                          this.activeFilters[
                            foundIndex
                          ].translation = sector.subData
                            .find((x) => x.key === val.value)
                            .label.trim();
                        }
                      });
                    }
                  }, 1);
                  // Organizations organization name
                } else if (tab === 'organizations') {
                  if (
                    source.organization?.organizationName?.buckets?.length > 0
                  ) {
                    source.organization.organizationName.buckets.forEach(
                      (org) => {
                        if (org.organizationId.buckets[0]?.key === val.value) {
                          const foundIndex = this.activeFilters.findIndex(
                            (x) => x.value === val.value
                          );
                          this.activeFilters[
                            foundIndex
                          ].translation = org.key?.trim();
                        }
                      }
                    );
                  }
                  // Funding calls organization name
                } else if (tab === 'funding-calls') {
                  if (
                    source.organization?.orgId?.buckets?.length > 0
                  ) {
                    source.organization.orgId.buckets.forEach(
                      (org) => {
                        if (org.key === val.value) {
                          const foundIndex = this.activeFilters.findIndex(
                            (x) => x.value === val.value
                          );
                          this.activeFilters[
                            foundIndex
                          ].translation = org.orgName.buckets[0]?.key?.trim();
                        }
                      }
                    );
                  }
                }
              }

              // Country code
              if (val.category === 'countryCode' && source.countryCode) {
                switch (val.value) {
                  case 'c0': {
                    val.translation =
                      $localize`:@@publicationCountry:Julkaisumaa` +
                      ': ' +
                      $localize`:@@finland:Suomi`;
                    break;
                  }
                  case 'c1': {
                    val.translation =
                      $localize`:@@publicationCountry:Julkaisumaa` +
                      ': ' +
                      $localize`:@@other:Muut`;
                    break;
                  }
                }
              }
              // JuFo code
              if (val.category === 'juFo' && source.juFo) {
                switch (val.value) {
                  case 'j3': {
                    val.translation =
                      $localize`:@@jufoLevel:Julkaisufoorumitaso` + ': 3';
                    break;
                  }
                  case 'j2': {
                    val.translation =
                      $localize`:@@jufoLevel:Julkaisufoorumitaso` + ': 2';
                    break;
                  }
                  case 'j1': {
                    val.translation =
                      $localize`:@@jufoLevel:Julkaisufoorumitaso` + ': 1';
                    break;
                  }
                  case 'j0': {
                    val.translation =
                      $localize`:@@jufoLevel:Julkaisufoorumitaso` + ': 0';
                    break;
                  }
                }
              }
              // Related publications
              if (val.category === 'coPublication') {
                this.activeFilters.find(
                  (item) => item.category === 'coPublication'
                ).translation = $localize`:@@coPublications:Yhteisjulkaisut`;
              }

              // Funding
              // Type of funding
              if (val.category === 'typeOfFunding' && source.typeOfFunding) {
                source.typeOfFunding.types.buckets.forEach((type) => {
                  setTimeout((t) => {
                    if (type.subData.find((x) => x.key === val.value)) {
                      const foundIndex = this.activeFilters.findIndex(
                        (x) => x.value === val.value
                      );
                      this.activeFilters[
                        foundIndex
                      ].translation = type.subData.find(
                        (x) => x.key === val.value
                      ).label;
                    }
                  }, 1);
                });
              }

              // Funder
              if (val.category === 'funder' && source.funder) {
                setTimeout((t) => {
                  const result = source.funder.funders.buckets.find(
                    (key) => key.funderId.buckets[0].key === val.value
                  );
                  const foundIndex = this.activeFilters.findIndex(
                    (x) => x.value === val.value
                  );
                  this.activeFilters[foundIndex].translation = result.label
                    ? result.label
                    : result.key;
                }, 1);
              }

              // Datasets
              if (val.category === 'dataSource' && source.dataSource) {
                setTimeout((t) => {
                  const result = source.dataSource.dataSources.buckets.find(
                    (key) => key.key === val.value
                  );
                  const foundIndex = this.activeFilters.findIndex(
                    (x) => x.value === val.value
                  );
                  this.activeFilters[foundIndex].translation = result.label
                    ? result.label
                    : result.key;
                }, 1);
              }

              // Infrastructures
              // Type
              if (val.category === 'type' && source.type) {
                // Hotfix for type translation. Type is translated in filters / infrastructures via localize method.
                // This might cause some latency and therefore timeout is needed.
                setTimeout((t) => {
                  const result = source.type.types.buckets.find(
                    ({ key }) => key === val.value
                  );
                  const foundIndex = this.activeFilters.findIndex(
                    (x) => x.value === val.value
                  );
                  this.activeFilters[foundIndex].translation = result.key
                    ? result.key.charAt(0).toUpperCase() + result.key.slice(1)
                    : '';
                }, 1);
              }

              // Infrastructure main field of science
              if (
                tab === 'infrastructures' &&
                val.category === 'field' &&
                source.infraField
              ) {
                // Map id to root so it's easier to find
                source.infraField.infraFields.buckets.map(
                  (item) => (item.id = item.majorId.buckets[0].key)
                );
                setTimeout((t) => {
                  const result = source.infraField.infraFields.buckets.find(
                    (id) => id.id === val.value
                  );
                  const foundIndex = this.activeFilters.findIndex(
                    (x) => x.value === val.value
                  );
                  this.activeFilters[foundIndex].translation = result.label
                    ? result.label
                    : result.key;
                }, 1);
              }

              // Organization, sector
              if (val.category === 'sector' && source.sector) {
                const result = source.sector.sectorId.buckets.find(
                  ({ key }) => key === val.value
                );
                const foundIndex = this.activeFilters.findIndex(
                  (x) => x.value === val.value
                );
                this.activeFilters[foundIndex].translation = result.sectorName
                  ? result.sectorName.buckets[0].key
                  : '';
              }

              // News, organization
              if (tab === 'news' && source.organization) {
                setTimeout((t) => {
                  if (source.organization.buckets) {
                    source.organization.buckets.forEach((sector) => {
                      if (
                        sector.orgName.buckets.find(
                          (x) => x.orgId.buckets[0].key === val.value
                        )
                      ) {
                        const foundIndex = this.activeFilters.findIndex(
                          (x) => x.value === val.value
                        );
                        this.activeFilters[
                          foundIndex
                        ].translation = sector.orgName.buckets
                          .find((x) => x.orgId.buckets[0].key === val.value)
                          .label.trim();
                      }
                    });
                  }
                }, 1);
              }
            });
            // Set flag when all filters are translated & filter items that aren't hidden
            this.translationFlag = true;
            if (this.translationFlag === true) {
              this.parsedFilters = this.activeFilters.filter(
                (item) => !item.hide
              );
            }
          }
        });
      // Sort active filters by numerical value
      this.activeFilters = this.activeFilters.sort(
        (a, b) => b.translation - a.translation
      );
    });
  }

  removeFilter(event): void {
    // Remove range filters. Check that target active filter matches fromYear filter
    if (
      event.target.id.length === 5 &&
      (event.target.id.slice(0, 1) === 'f' ||
        event.target.id.slice(0, 1) === 't')
    ) {
      if (this.fromYear && this.toYear) {
        this.activeFilters = this.activeFilters.filter(
          (elem) => elem.category !== 'fromYear'
        );
        this.activeFilters = this.activeFilters.filter(
          (elem) => elem.category !== 'toYear'
        );
        this.activeFilters = this.activeFilters.filter(
          (elem) =>
            !(
              this.fromYear <= parseInt(elem.value, 10) &&
              parseInt(elem.value, 10) <= this.toYear
            )
        );
      } else if (this.fromYear) {
        this.activeFilters = this.activeFilters.filter(
          (elem) => elem.category !== 'fromYear'
        );
        this.activeFilters = this.activeFilters.filter(
          (elem) => !(this.fromYear <= parseInt(elem.value, 10))
        );
      } else if (this.toYear) {
        this.activeFilters = this.activeFilters.filter(
          (elem) => elem.category !== 'toYear'
        );
        this.activeFilters = this.activeFilters.filter(
          (elem) => !(this.toYear >= parseInt(elem.value, 10))
        );
      }
    }

    this.activeFilters = this.activeFilters.filter(
      (elem) => elem.value !== event.target.id
    );

    const params = this.activeFilters.reduce((storage, item) => {
      // get the first instance of the category
      const group = item.category;

      // set storage or initialize it
      storage[group] = storage[group] || [];

      // add the current item to storage
      storage[group].push(item.value);

      // return the updated storage to the next iteration
      return storage;
    }, {}); // initially empty object {} as storage

    params.sort = this.sortService.sortMethod;

    this.router.navigate([], {
      queryParams: {
        ...params,
        target: this.settingsService.target,
        search: this.searchService.searchTerm,
      },
    });
  }

  clearFilters() {
    this.activeFilters = [];
    // Preserve target if available
    this.router.navigate([], {
      queryParams: { target: this.settingsService.target },
    });
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
        tabFilters: this.tabFilters,
      },
    });
  }
}
