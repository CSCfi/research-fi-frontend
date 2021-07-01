import {
  Component,
  OnInit,
  Inject,
  LOCALE_ID,
  AfterViewInit,
  OnDestroy,
  PLATFORM_ID,
  ViewEncapsulation,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
} from '@angular/core';
import { SearchService } from 'src/app/portal/services/search.service';
import { Title } from '@angular/platform-browser';
import { TabChangeService } from 'src/app/portal/services/tab-change.service';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { WINDOW } from 'src/app/shared/services/window.service';
import { ResizeService } from 'src/app/shared/services/resize.service';
import { common, fundingCalls } from 'src/assets/static-data/meta-tags.json';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { combineLatest, merge, Subject, Subscription } from 'rxjs';
import { FundingCall } from '@portal/models/funding-call.model';
import { debounceTime, map, multicast, skip, take } from 'rxjs/operators';
import { SortService } from '@portal/services/sort.service';
import { FilterService } from '@portal/services/filters/filter.service';
import { DataService } from '@portal/services/data.service';
import { Search } from '@portal/models/search.model';

@Component({
  selector: 'app-funding-calls',
  templateUrl: './funding-calls.component.html',
  styleUrls: ['./funding-calls.component.scss']
})
export class FundingCallsComponent implements OnInit, AfterViewInit {
    width = this.window.innerWidth;
    mobile = this.width < 992;
    @ViewChild('skipToResults') skipToResults: ElementRef;

  
    private currentLocale: string;
    private metaTags = fundingCalls;
    private commonTags = common;
  
    queryParams: any;
    currentTerm: string;
  
    combinedRouteParams: Subscription;
    focusSub: Subscription;
    resizeSub: Subscription;
    routeSub: Subscription;
    queryParamSub: Subscription;
    inputSub: Subscription;
    totalSub: Subscription;
  
    total: number;
    parsedTotal: string;

    isBrowser: boolean;
    dataFetched: any;

    filterValues: unknown;
    filters: any;  

    resultData: Search;
    page: number;
    loading: boolean;
    errorMessage: string;

    tabSub: Subscription;
    showSkipLinks: boolean;
  

    selectedTabData: {
      data: string;
      label: string;
      link: string;
      icon: any;
      singular: any;
    };
  
    constructor(
      public searchService: SearchService,
      private titleService: Title,
      @Inject(LOCALE_ID) protected localeId: string,
      private tabChangeService: TabChangeService,
      @Inject(PLATFORM_ID) private platformId: object,
      private route: ActivatedRoute,
      @Inject(WINDOW) private window: Window,
      private resizeService: ResizeService,
      public utilityService: UtilityService,
      public sortService: SortService,
      public filterService: FilterService,
      public dataService: DataService,
      private router: Router,
      private cdr: ChangeDetectorRef,
    ) {
      this.isBrowser = isPlatformBrowser(this.platformId);
      this.currentLocale =
        this.localeId.charAt(0).toUpperCase() + this.localeId.slice(1);
    }
  
    ngOnInit() {
      this.routeSub = this.route.queryParams.subscribe((queryParams) => {
        this.queryParams = queryParams;
  
        if (queryParams.search) {
          this.searchService.updateInput(queryParams.search);
        } else {
          this.searchService.updateInput('');
        }

        // Get values
        this.page = parseInt(queryParams.page) || 1;
        this.searchService.pageSize = parseInt(queryParams.size) || 10;
  
        // Check for Angular Univeral SSR, get filters if browser
        if (isPlatformBrowser(this.platformId)) {
          this.filters = this.filterService.filterList(queryParams);
          this.filterService.updateFilters(this.filters);
        }
  
        // Update tab
        this.selectedTabData = this.tabChangeService.fundingCall;
        this.tabChangeService.changeTab(this.selectedTabData);
        this.sortService.updateTab('funding-calls');

        // Update search service stuff
        this.sortService.updateSort(queryParams.sort);
        this.searchService.updatePageNumber(
          this.page,
          this.searchService.pageSize
        );
        this.searchService.updateQueryParams(queryParams);
        
        // Get data
        this.getData();
        this.getFilterData();
      });

      this.totalSub = this.searchService.currentTotal.subscribe((total) => {
        this.total = total || 0;
        // Add thousand separators and set total to 0 if no hits
        this.parsedTotal = this.total
          ? total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
          : '0';
        this.cdr.detectChanges();
        this.dataService.updateTotalResultsValue(this.total);
      });

      // Search input handler
      this.inputSub = this.searchService.currentInput.subscribe(
        (input) => (this.currentTerm = input)
      );

      // Set title
      switch (this.localeId) {
        case 'fi': {
          this.setTitle('Rahoitushaut - Tiedejatutkimus.fi');
          break;
        }
        case 'en': {
          this.setTitle('Funding calls - Research.fi');
          break;
        }
        case 'sv': {
          this.setTitle('Funding calls - Research.fi');
          break;
        }
      }

  
      this.utilityService.addMeta(
        this.metaTags['title' + this.currentLocale],
        this.metaTags['description' + this.currentLocale],
        this.commonTags['imgAlt' + this.currentLocale]
      );
  
      this.resizeSub = this.resizeService.onResize$.subscribe((dims) =>
        this.onResize(dims)
      );

      // Search input handler
    this.inputSub = this.searchService.currentInput.subscribe(
      (input) => {
        this.currentTerm = input;
      }
    );
    }
  
    ngAfterViewInit() {
      // Set focus to header
      this.tabSub = this.tabChangeService.currentFocus.subscribe((focus) => {
        if (focus) {
          this.showSkipLinks = true;
          this.skipToResults.nativeElement.focus();
        }
      });
      // Focus to skip-to results link when clicked from header skip-links
      this.tabChangeService.currentFocusTarget.subscribe((target) => {
        if (target === 'main-link') {
          this.skipToResults.nativeElement.focus();
        }
      });
      this.cdr.detectChanges();
    }
  
    changeFocusTarget(target) {
      this.tabChangeService.targetFocus(target);
    }

    // Reset focus on blur
    resetFocus() {
      this.tabChangeService.changeFocus(false);
    }

    getData() {
      this.searchService
        .getData()
        .subscribe(
          (data) => {
            this.resultData = data;
            this.searchService.updateTotal(data.total)
            console.log(data)
            this.loading = false;
          },
          (error) => (this.errorMessage = error as any)
        );
    }

    searchFundingCalls(term) {
      this.searchService.updateInput(term);
      const params = Object.assign({}, this.queryParams);
      params.search = term;
      this.router.navigate([], { queryParams: params });
      this.getData();
      this.getFilterData();
    }

    getFilterData() {
      // Check for Angular Univeral SSR, get filter data if browser
      if (isPlatformBrowser(this.platformId)) {
        this.searchService.getFundingCallFilters().subscribe(
          (filterValues) => {
            this.filterValues = filterValues;
            // Send response to data service
            this.dataService.changeResponse(this.filterValues);
          },
          (error) => (this.errorMessage = error as any)
        );
      }
    }

    resetSearch() {
      this.currentTerm = '';
      this.searchService.updateInput('');
      const params = Object.assign({}, this.queryParams);
      params.search = null;
      this.router.navigate([], { queryParams: params });
    }
  
    setTitle(newTitle: string) {
      this.titleService.setTitle(newTitle);
    }
  
    ngOnDestroy() {
      this.tabChangeService.targetFocus('');
      if (isPlatformBrowser(this.platformId)) {
        this.resizeSub?.unsubscribe();
      }
      this.tabChangeService.focus = undefined;
      this.routeSub?.unsubscribe;
      this.queryParamSub?.unsubscribe;
    }
  
    onResize(event) {
      this.width = event.width;
      if (this.width >= 992) {
        this.mobile = false;
      } else {
        this.mobile = true;
      }
    }
  }
  