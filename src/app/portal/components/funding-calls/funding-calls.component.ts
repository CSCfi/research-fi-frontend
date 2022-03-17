import {
  Component,
  OnInit,
  Inject,
  LOCALE_ID,
  AfterViewInit,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  ViewEncapsulation,
} from '@angular/core';
import { SearchService } from 'src/app/portal/services/search.service';
import { TabChangeService } from 'src/app/portal/services/tab-change.service';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import MetaTags from 'src/assets/static-data/meta-tags.json';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { Subscription } from 'rxjs';
import { SortService } from '@portal/services/sort.service';
import { FilterService } from '@portal/services/filters/filter.service';
import { DataService } from '@portal/services/data.service';
import { Search } from '@portal/models/search.model';
import { AppSettingsService } from '@shared/services/app-settings.service';

@Component({
  selector: 'app-funding-calls',
  templateUrl: './funding-calls.component.html',
  styleUrls: ['./funding-calls.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FundingCallsComponent implements OnInit, AfterViewInit, OnDestroy {
  mobile: boolean;
  @ViewChild('skipToResults') skipToResults: ElementRef;

  private currentLocale: string;
  private metaTags = MetaTags.fundingCalls;
  private commonTags = MetaTags.common;

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

  auroraInfo = $localize`:@@fundingCallAuroraInfo:Huom! Tiedoissa voi olla epätarkkuuksia alkuvuodesta 2022 Aurora-tietokannan toiminnan lakkaamisesta ja uusien tiedonsiirtojen käyttöönotosta johtuen. Varmista tiedot rahoittajan omilta verkkosivuilta.`;

  selectedTabData: {
    data: string;
    label: string;
    link: string;
    icon: any;
    singular: any;
  };
  mobileStatusSub: any;

  constructor(
    public searchService: SearchService,
    @Inject(LOCALE_ID) protected localeId: string,
    private tabChangeService: TabChangeService,
    @Inject(PLATFORM_ID) private platformId: object,
    private route: ActivatedRoute,
    public utilityService: UtilityService,
    public sortService: SortService,
    public filterService: FilterService,
    public dataService: DataService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private appSettingsService: AppSettingsService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.currentLocale = this.appSettingsService.capitalizedLocale;
  }

  ngOnInit() {
    this.routeSub = this.route.queryParams.subscribe((queryParams) => {
      this.queryParams = queryParams;

      this.tabChangeService.tabQueryParams.fundingCall = this.queryParams;

      if (queryParams.search) {
        this.searchService.updateInput(queryParams.search);
      } else {
        this.searchService.updateInput('');
      }

      // Get values
      this.page = parseInt(queryParams.page) || 1;
      this.searchService.pageSize = parseInt(queryParams.size) || 10;

      // Update tab
      this.selectedTabData = this.tabChangeService.fundingCall;
      this.tabChangeService.changeTab(this.selectedTabData);
      this.sortService.updateTab('funding-calls');

      // Check for Angular Univeral SSR, get filters if browser
      if (isPlatformBrowser(this.platformId)) {
        this.filters = this.filterService.filterList(queryParams);
        this.filterService.updateFilters(this.filters);
      }

      // Update search service stuff
      this.sortService.updateSort(queryParams.sort);
      this.searchService.updatePageNumber(
        this.page,
        this.searchService.pageSize
      );
      this.searchService.updateQueryParams(queryParams);

      // Reset data so old is not shown while loading
      // Prevent page scrolling on query param changes in portal.module.ts
      this.resultData = undefined;
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

    // Handle mobile status
    this.mobileStatusSub = this.appSettingsService.mobileStatus.subscribe(
      (status: boolean) => {
        this.mobile = status;
      }
    );

    // Search input handler
    this.inputSub = this.searchService.currentInput.subscribe((input) => {
      this.currentTerm = input;
    });
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
    this.searchService.getData().subscribe(
      (data) => {
        this.resultData = data;
        this.searchService.updateTotal(data.total);
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
    this.utilityService.setTitle(newTitle);
  }

  ngOnDestroy() {
    this.tabChangeService.targetFocus('');
    if (isPlatformBrowser(this.platformId)) {
      this.resizeSub?.unsubscribe();
    }
    this.tabChangeService.focus = undefined;
    this.routeSub?.unsubscribe;
    this.queryParamSub?.unsubscribe;
    this.mobileStatusSub?.unsubscribe;
  }
}
