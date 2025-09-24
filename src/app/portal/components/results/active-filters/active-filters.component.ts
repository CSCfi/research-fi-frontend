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
  Inject,
  PLATFORM_ID,
  LOCALE_ID,
  Output,
  EventEmitter,
} from '@angular/core';
import { Router } from '@angular/router';
import { SortService } from '@portal/services/sort.service';
import { FilterService } from '@portal/services/filters/filter.service';
import { TabChangeService } from '@portal/services/tab-change.service';
import { PublicationFilterService } from '@portal/services/filters/publication-filter.service';
import { PersonFilterService } from '@portal/services/filters/person-filter.service';
import { FundingFilterService } from '@portal/services/filters/funding-filter.service';
import { DatasetFilterService } from '@portal/services/filters/dataset-filter.service';
import { InfrastructureFilterService } from '@portal/services/filters/infrastructure-filter.service';
import { OrganizationFilterService } from '@portal/services/filters/organization-filter.service';
import { SettingsService } from '@portal/services/settings.service';
import { NewsFilterService } from '@portal/services/filters/news-filter.service';
import { SearchService } from '@portal/services/search.service';
import { isPlatformBrowser, NgIf } from '@angular/common';
import { FundingCallFilterService } from '@portal/services/filters/funding-call-filter.service';
import { StaticDataService } from '@portal/services/static-data.service';
import { FilterConfigType } from 'src/types';
import { ActiveFiltersListComponent } from '../../../../shared/components/active-filters-list/active-filters-list.component';
import { ProjectFilterService } from '@portal/services/filters/project-filter.service';

@Component({
    selector: 'app-active-filters',
    templateUrl: './active-filters.component.html',
    styleUrls: ['./active-filters.component.scss'],
    imports: [NgIf, ActiveFiltersListComponent]
})
export class ActiveFiltersComponent
  implements OnInit, OnDestroy, AfterContentInit
{
  queryParams: any;
  activeFilters = [];

  translations = {
    noAccessInfo: $localize`:@@noInfo:Ei tietoa`,
    openAccess: $localize`:@@openAccessPublicationChannel:Open Access -julkaisukanava`,
    nonOpenAccess: $localize`:@@nonOpen:Ei avoin`,
    noVal: $localize`:@@noRating:Ei arviota`,
    otherOpen: $localize`:@@otherOpenAccess:Muu avoin saatavuus`,
    noOpenAccessData: $localize`:@@noInfo:Ei tietoa`,
    selfArchived: $localize`:@@selfArchived:Rinnakkaistallennettu`,
    delayedOpenAccess: $localize`:@@delayedOpenAccess:Viivästetty avoin saatavuus`,
    undefined: $localize`:@@notKnown:Ei tiedossa`,
    // Dataset access types
    open: $localize`:@@datasetAccessOpen:Avoin`,
    permit: $localize`:@@datasetAccessPermit:Vaatii luvan hakemista Fairdata-palvelussa`,
    login: $localize`:@@datasetAccessLogin:Vaatii kirjautumisen Fairdata-palvelussa`,
    restricted: $localize`:@@datasetAccessRestricted:Saatavuutta rajoitettu`,
    embargo: $localize`:@@datasetAccessEmbargo:Embargo`,
    // Funding-call status
    closed: $localize`:@@closedCalls:Päättyneet haut`,
    currentlyOpen: $localize`:@@openCalls:Avoimet haut pl. tulevat`,
    future: $localize`:@@futureCalls:Tulevat haut`,
    continuous: $localize`:@@continuousCalls:Jatkuvat haut`,
  };

  @Output() clearAllFilters = new EventEmitter<any>();

  filterResponse: any;
  filtersConfig: FilterConfigType[];
  response: any;
  tabSub: any;
  currentTab: any;
  hoverIndex: any;
  fromYear: number;
  toYear: number;

  translationFlag: boolean;
  parsedFilters: any[];
  yearRange: string;
  isBrowser: any;
  errorMessage: any;

  activeFiltersDialogConfig: {
    filtersConfig: any;
    fromYear: number;
    toYear: number;
  };

  constructor(
    private router: Router,
    private sortService: SortService,
    private filterService: FilterService,
    private staticDataService: StaticDataService,
    private tabChangeService: TabChangeService,
    private publicationFilters: PublicationFilterService,
    private personFilters: PersonFilterService,
    private fundingFilters: FundingFilterService,
    private datasetFilters: DatasetFilterService,
    private infrastructureFilters: InfrastructureFilterService,
    private organizationFilters: OrganizationFilterService,
    private fundingCallFilters: FundingCallFilterService,
    private projectFilters: ProjectFilterService,
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
        this.filtersConfig = this.publicationFilters.filterData;
        this.yearRange = $localize`:@@yearOfPublication:Julkaisuvuosi` + ': ';
        break;
      case 'fundings':
        this.filtersConfig = this.fundingFilters.filterData;
        this.yearRange = $localize`:@@startYear:Aloitusvuosi` + ': ';
        break;
      case 'datasets':
        this.filtersConfig = this.datasetFilters.filterData;
        this.yearRange = $localize`:@@yearOfPublication:Julkaisuvuosi` + ': ';
        break;
      case 'infrastructures':
        this.filtersConfig = this.infrastructureFilters.filterData;
        this.yearRange = $localize`:@@startYear:Aloitusvuosi` + ': ';
        break;
      // case 'persons':
      //   this.filtersConfig = this.personFilters.filterData;
      //   break;
      case 'organizations':
        this.filtersConfig = this.organizationFilters.filterData;
        break;
      case 'funding-calls':
        this.filtersConfig = this.fundingCallFilters.filterData;
        this.yearRange = $localize`:@@applicationPeriod:Hakuaika` + ': ';
        break;
      case 'news':
        this.filtersConfig = this.newsFilters.filterData;
        break;
      case 'projects':
        this.filtersConfig = this.projectFilters.filterData;
        break;

      default:
        break;
    }
  }

  ngAfterContentInit() {
    this.translate();
  }

  translate() {
    this.translationFlag = false;
    const errorMsg = 'error translating filter';

    this.queryParams = this.filterService.filters.subscribe((allFilters) => {
      // Get from & to year values from filter list
      this.fromYear = parseInt(allFilters.fromYear[0]?.slice(1), 10);
      this.toYear = parseInt(allFilters.toYear[0]?.slice(1), 10);
      const years = allFilters.year.map((item) => parseInt(item, 10));
      let yearWarning = false;

      if (this.fromYear && this.toYear) {
        // Check if years missing between range and add warning flag
        if (
          allFilters.year.filter(
            (item) => this.fromYear <= item && item <= this.toYear
          ).length !==
          this.toYear - this.fromYear + 1
        ) {
          yearWarning = true;
        }
      } else if (this.fromYear) {
        if (
          allFilters.year.filter((item) => this.fromYear <= item).length !==
          Math.max(...years) - this.fromYear + 1
        ) {
          yearWarning = true;
        }
      } else if (this.toYear) {
        if (
          allFilters.year.filter((item) => this.toYear >= item).length !==
          this.toYear + 1 - Math.min(...years)
        ) {
          yearWarning = true;
        }
      }

      // Reset active filter so push doesn't duplicate
      this.activeFilters = [];
      const filtersFromAllCategories = {};

      // Merge and format arrays
      Object.keys(allFilters).forEach((key) => {
        filtersFromAllCategories[key] = allFilters[key].map((val) => {
          return {
            category: key,
            value: val,
            translation: this.translations[val] || val,
          };
        });
        this.activeFilters.push(...filtersFromAllCategories[key]);
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
            case 'persons': {
              this.response = this.personFilters.shapeData(response);
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
            case 'projects': {
              this.response = this.projectFilters.shapeData(response);
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
                const dateString = allFilters.date ? allFilters.date[0] : '';
                const startDate = dateString?.split('|')[0];
                const endDate = dateString?.split('|')[1];
                const startDateString = startDate
                  ? new Date(startDate).toLocaleDateString('fi')
                  : '';
                const endDateString = endDate
                  ? new Date(endDate).toLocaleDateString('fi')
                  : '';
                if (startDateString && endDateString) {
                  val.translation =
                    this.yearRange + startDateString + ' - ' + endDateString;
                } else if (startDateString) {
                  val.translation =
                    this.yearRange +
                    $localize`:@@startsEarliest:Alkaa aikaisintaan` +
                    ' ' +
                    startDateString;
                } else if (endDateString) {
                  val.translation =
                    this.yearRange +
                    $localize`:@@closesLatest:Päättyy viimeistään` +
                    ' ' +
                    endDateString;
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
                  (key) => {
                    const res = key.fieldId.buckets.find(item => {
                      return parseInt(item.key, 10) === parseInt(val.value, 10)
                    });
                    return res;
                  }
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
                val.category === 'articleType' &&
                source.articleType.buckets
              ) {
                const staticData = this.staticDataService.articleType;
                const result = source.articleType.buckets.find(
                  (item) => item.key.toString() === val.value
                );
                // Find corresponding label from static data service
                result.label = staticData.find(
                  (x) => val.value === x.id.toString()
                ).label;
                // If unknown, display filter name
                if (val.value === '-1') {
                  result.label =
                    $localize`:@@articleType:Artikkelin tyyppi` +
                    ': ' +
                    result.label;
                }

                const foundIndex = this.activeFilters.findIndex(
                  (x) => x.category === 'articleType' && x.value === val.value
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

              if (val.category === 'okmDataCollection') {
                this.activeFilters.find(
                  (item) => item.category === 'okmDataCollection'
                ).translation = $localize`:@@okmDataCollectionShort:Kuuluu OKM:n tiedonkeruuseen`;
              }

              // Organization filter
              if (val.category === 'organization' && source.organization) {
                // Funding organization name
                if (tab === 'fundings') {
                  setTimeout(() => {
                    if (source.organization.funded.sectorName.buckets) {
                      source.organization.funded.sectorName.buckets.forEach(
                        (sector) => {
                          if (sector.subData.find((x) => x.key === val.value)) {
                            const foundIndex = this.activeFilters.findIndex(
                              (x) => x.value === val.value
                            );
                            this.activeFilters[foundIndex].translation =
                              sector.subData
                                .find((x) => x.key === val.value)
                                .label.trim();
                          }
                        }
                      );
                    }
                  }, 1);
                  // Dataset & persons organization name
                } else if (tab === 'datasets' || tab === 'persons') {
                  setTimeout(() => {
                    if (source.organization.sectorName.buckets) {
                      source.organization.sectorName.buckets.forEach(
                        (sector) => {
                          if (sector.subData.find((x) => x.key === val.value)) {
                            const foundIndex = this.activeFilters.findIndex(
                              (x) => x.value === val.value
                            );
                            this.activeFilters[foundIndex].translation =
                              sector.subData
                                .find((x) => x.key === val.value)
                                .label.trim();
                          }
                        }
                      );
                    }
                  }, 1);
                  // Infrastructure organization name
                } else if (tab === 'infrastructures') {
                  setTimeout(() => {
                    if (source.organization.sector.buckets) {
                      source.organization.sector.buckets.forEach((sector) => {
                        if (sector.subData.find((x) => x.key === val.value)) {
                          const foundIndex = this.activeFilters.findIndex(
                            (x) => x.value === val.value
                          );
                          this.activeFilters[foundIndex].translation =
                            sector.subData
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
                          this.activeFilters[foundIndex].translation =
                            org.key?.trim();
                        }
                      }
                    );
                  }
                  // Funding calls organization name
                } else if (tab === 'funding-calls') {
                  if (source.organization?.orgId?.buckets?.length > 0) {
                    source.organization.orgId.buckets.forEach((org) => {
                      if (org.key === val.value) {
                        const foundIndex = this.activeFilters.findIndex(
                          (x) => x.value === val.value
                        );
                        this.activeFilters[foundIndex].translation =
                          org.orgName.buckets[0]?.key?.trim();
                      }
                    });
                  }
                } else if (tab === 'projects') {
                  if (source.organizations?.organization?.buckets){
                    source.organizations.organization.buckets.forEach(
                      (bucket) => {
                        if (bucket.key === val.value) {
                          const foundIndex = this.activeFilters.findIndex(
                            (x) => x.value === val.value
                          );
                          this.activeFilters[foundIndex].translation = bucket.translation;
                        }
                      }
                    );
                  }
                }
                else {
                  // Common usage e.g. in publications, persons, datasets
                  setTimeout(() => {
                    if (source.organization.sectorName.buckets) {
                      source.organization.sectorName.buckets.forEach(
                        (sector) => {
                          if (sector.subData.find((x) => x.key === val.value)) {
                            const foundIndex = this.activeFilters.findIndex(
                              (x) => x.value === val.value
                            );
                            this.activeFilters[foundIndex].translation =
                              sector.subData
                                .find((x) => x.key === val.value)
                                .label.trim();
                          }
                        }
                      );
                    }
                  }, 1);
                }
              }

              // Country code
              if (val.category === 'countryCode' && source.countryCode) {
                switch (val.value) {
                  case 'c0': {
                    val.translation =
                      $localize`:@@publisherInternationality:Kustantajan kansainvälisyys` +
                      ': ' +
                      $localize`:@@finland:Kotimainen`;
                    break;
                  }
                  case 'c1': {
                    val.translation =
                      $localize`:@@publisherInternationality:Kustantajan kansainvälisyys` +
                      ': ' +
                      $localize`:@@other:Kansainvälinen`;
                    break;
                  }
                  case 'c9': {
                    val.translation =
                      $localize`:@@publisherInternationality:Kustantajan kansainvälisyys` +
                      ': ' +
                      $localize`:@@notSpecified:Ei tietoa`;
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
                      this.activeFilters[foundIndex].translation =
                        type.subData.find((x) => x.key === val.value).label;
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
                        this.activeFilters[foundIndex].translation =
                          sector.orgName.buckets
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

      // Generate active filters list dialog config
      this.activeFiltersDialogConfig = {
        filtersConfig: this.filtersConfig,
        fromYear: this.fromYear,
        toYear: this.toYear,
      };
    });
  }

  removeFilter(event): void {
    // Remove range filters. Check that target active filter matches fromYear filter
    if (
      event.value.length === 5 &&
      (event.value.slice(0, 1) === 'f' || event.value.slice(0, 1) === 't')
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
      (elem) => elem.value !== event.value
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
    this.clearAllFilters.emit(null);
    this.activeFilters = [];
    // Preserve target if available
    this.router.navigate([], {
      queryParams: { target: this.settingsService.target },
    });
  }

  ngOnDestroy() {
    this.queryParams?.unsubscribe();
    this.filterResponse?.unsubscribe();
  }

  // Set index for warning hover
  enter(index) {
    this.hoverIndex = index;
  }

  leave() {
    this.hoverIndex = null;
  }
}
