//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, ViewChild, ElementRef, OnInit, OnDestroy, ChangeDetectorRef, Inject, LOCALE_ID,
  PLATFORM_ID, AfterViewInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { SearchService } from '../../services/search.service';
import { SortService } from '../../services/sort.service';
import { map, multicast, debounceTime, take, skip } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { TabChangeService } from '../../services/tab-change.service';
import { ResizeService } from '../../services/resize.service';
import { FilterService } from '../../services/filter.service';
import { DataService } from '../../services/data.service';
import { Subscription, combineLatest, Subject, merge } from 'rxjs';
import { WINDOW } from 'src/app/services/window.service';
import { BsModalService } from 'ngx-bootstrap';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit, OnDestroy, AfterViewInit {
  public searchTerm: any;
  input: Subscription;
  tabData = this.tabChangeService.tabData;
  tab: any = [];
  selectedTabData: {data: string, labelFi: string, labelEn: string, link: string, icon: any};
  public tabValues: any;
  public filterValues: any;
  errorMessage = [];
  pageNumber = 1;
  page: any;
  expandStatus: Array<boolean> = [];
  @ViewChild('singleId') singleId: ElementRef;
  @ViewChild('srHeader', { static: true }) srHeader: ElementRef;
  @ViewChild('totalHeader') totalHeader: ElementRef;
  queryParams: Subscription;
  publicationFilters: {year: any[], field: any[], publicationType: any[], countryCode: any[],
    lang: any[], juFo: any[], openAccess: any[], internationalCollaboration: any[], organization: any[]};
  fundingFilters: {fundingStatus: any[], fundingAmount: any[], sector: any[]};
  filters: any;
  mobile: boolean;
  updateFilters: boolean;
  total: number | string;
  parsedTotal: string;
  currentQueryParams: any;
  init = true;
  isBrowser: boolean;

  totalSub: Subscription;
  combinedRouteParams: Subscription;
  tabSub: Subscription;

  pageFallback = false;

  constructor( private searchService: SearchService, private route: ActivatedRoute, private titleService: Title,
               private tabChangeService: TabChangeService, private router: Router, private resizeService: ResizeService,
               private sortService: SortService, private filterService: FilterService, private cdr: ChangeDetectorRef,
               @Inject( LOCALE_ID ) protected localeId: string, @Inject(WINDOW) private window: Window,
               @Inject(PLATFORM_ID) private platformId: object, private dataService: DataService, private modalService: BsModalService,
               private utilityService: UtilityService ) {
    this.filters = Object.assign({}, this.publicationFilters, this.fundingFilters);
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.total = 1;
  }

  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  ngOnInit() {
    // Subscribe to route params and query params in one subscription
    this.combinedRouteParams = combineLatest([this.route.params, this.route.queryParams])
      .pipe(map(results => ({params: results[0], query: results[1]})),
            multicast(new Subject(), s => merge(s.pipe(take(1)),        // First call is instant, after that debounce
                                                s.pipe(skip(1), debounceTime(1)))))
      .subscribe(results => {
        const query = results.query;
        const params = results.params;

        this.page = +query.page || 1;
        if (this.page > 1000) {
          this.pageFallback = true;
          this.getTabValues();
          return;
        }

        // Check for Angular Univeral SSR, get filters if browser
        if (isPlatformBrowser(this.platformId)) {
          this.filters = {
            year: [query.year].flat().filter(x => x).sort(),
            fundingStatus: [query.fundingStatus].flat().filter(x => x).sort(),
            field: [query.field].flat().filter(x => x).sort(),
            publicationType: [query.publicationType].flat().filter(x => x).sort(),
            countryCode: [query.countryCode].flat().filter(x => x).sort(),
            lang: [query.lang].flat().filter(x => x).sort(),
            juFo: [query.juFo].flat().filter(x => x).sort(),
            openAccess: [query.openAccess].flat().filter(x => x).sort(),
            internationalCollaboration: [query.internationalCollaboration].flat().filter(x => x).sort(),
            fundingAmount: [query.fundingAmount].flat().filter(x => x).sort(),
            sector: [query.sector].flat().filter(x => x).sort(),
            organization: [query.organization].flat().filter(x => x).sort()
          };
        }

        const tabChanged = this.tab !== params.tab;

        this.searchTerm = params.input || '';
        // Send search term to sort service
        this.sortService.getTerm(this.searchTerm);

        // If there's a new search term, send it to search service
        if (this.searchTerm !== this.searchService.singleInput) {
          this.searchService.updateInput(this.searchTerm);
        }

        // Hotfix for *ngIf depending on total and not rendering search-results so new data is not fetched on empty results
        this.total = 1;
        this.selectedTabData = this.tabData.filter(tab => tab.link === params.tab)[0];
        // Default to publications if invalid tab
        if (!this.selectedTabData) {
          this.router.navigate(['results/publications']);
          return;
        }

        this.tab = this.selectedTabData.link;

        if (tabChanged) {
          this.tabChangeService.changeTab(this.selectedTabData);
          this.sortService.updateTab(this.selectedTabData.data);
          this.updateTitle(this.selectedTabData);

        }

        this.sortService.updateSort(query.sort);
        this.searchService.updatePageNumber(this.page);
        this.searchService.updateQueryParams(query);

        // Check for Angular Univeral SSR, update filters if browser
        if (isPlatformBrowser(this.platformId)) {this.filterService.updateFilters(this.filters); }

        // Flag telling search-results to fetch new filtered data
        this.updateFilters = !this.updateFilters;

        // If init without search bar redirecting, get data
        if (this.init && !this.searchService.redirecting) {
          this.getTabValues();
        // If search bar is redirecting, get data from search service. Get data "async" so result tab runs onChanges twice at startup
        } else if (this.searchService.redirecting) {
          setTimeout(() => {
            this.tabValues = [this.searchService.tabValues];
          }, 1);
        }
        // If new filter data is neeed
        if (tabChanged || this.init) {
          // Reset filter values so new tab doesn't try to use previous tab's filters.
          this.filterValues = undefined;
        }

        // Get data filter data
        this.getFilterData();

        // Reset flags
        this.searchService.redirecting = false;
        this.init = false;
      });

    this.totalSub = this.searchService.currentTotal.subscribe(total => {
      const totalCount = total.value;
      this.total = total.value || 0;
      // Add thousand separators and set total to 0 if no hits
      this.parsedTotal = this.total ? totalCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '0';
      this.cdr.detectChanges();
      this.dataService.updateTotalResultsValue(this.total);
      this.updateTitle(this.selectedTabData);
    });

    // Subscribe to resize
    this.resizeService.onResize$.subscribe(dims => this.updateMobile(dims.width));
    this.mobile = this.window.innerWidth < 992;
  }

  ngAfterViewInit() {
    // Set focus to header
    this.tabSub = this.tabChangeService.currentFocus.subscribe(focus => {
      if (focus) {
        this.totalHeader.nativeElement.focus();
      }
    });
  }

  // Reset focus on blur
  resetFocus() {
    this.tabChangeService.changeFocus(false);
  }

  navigateToVisualisation() {
    // Remove empty filter properties
    const trimmedFilters = this.filters;
    Object.keys(trimmedFilters).forEach((key) => (trimmedFilters[key].length === 0) && delete trimmedFilters[key]);
    // Navigate
    this.router.navigate(['visual/', this.route.snapshot.params.tab, this.searchTerm],
    { queryParams: trimmedFilters });
  }

  getTabValues() {
    this.searchService.getTabValues()
    .pipe(map(data => [data]))
    .subscribe(tabValues => {
      this.tabValues = tabValues;
    },
    error => this.errorMessage = error as any);
  }

  getFilterData() {
    // Check for Angular Univeral SSR, get filter data if browser
    if (isPlatformBrowser(this.platformId)) {
      this.searchService.getFilters()
      .pipe(map(data => [data]))
      .subscribe(filterValues => {
        this.filterValues = filterValues;
        // Send response to data service
        this.dataService.changeResponse(this.filterValues);
        // Set the title
        this.updateTitle(this.selectedTabData);
      },
        error => this.errorMessage = error as any);
    }
  }

  updateTitle(tab: { data: string; labelFi: string; labelEn: string}) {
    // Update title and <h1> with the information of the currently selected tab
    // Placeholder until real data is available
    const amount = tab.data ? this.dataService.totalResults : 999;
    // Set label by locale
    switch (this.localeId) {
      case 'fi': {
        this.setTitle('Haku - ' + tab.labelFi + ' - Tiedejatutkimus.fi')
        this.srHeader.nativeElement.innerHTML = this.titleService.getTitle().split(' - ', 2).join(' - ') + ' - ' + amount + 
        (amount === 1 ? ' hakutulos' : ' hakutulosta');
        break;
      }
      case 'en': {
        this.setTitle('Haku - ' + tab.labelEn + ' - Research.fi')
        this.srHeader.nativeElement.innerHTML = this.titleService.getTitle().split(' - ', 2).join(' - ') + ' - ' + amount + 
        (amount === 1 ? ' result' : ' results');
        break;
      }
    }
  }

  updateMobile(width) {
    this.mobile = width < 992;
  }

  // Unsubscribe to prevent memory leaks
  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      this.tabChangeService.changeTab({data: '', labelFi: '', labelEn: '', link: '', icon: ''});
      this.combinedRouteParams.unsubscribe();
      this.totalSub.unsubscribe();
      this.tabSub.unsubscribe();
    }
  }

}
