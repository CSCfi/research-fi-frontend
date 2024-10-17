//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import {
  Component,
  OnInit,
  Inject,
  LOCALE_ID,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  PLATFORM_ID,
  ViewEncapsulation,
  Input,
  OnChanges,
} from '@angular/core';
import { SearchService } from 'src/app/portal/services/search.service';
import { TabChangeService } from 'src/app/portal/services/tab-change.service';
import { isPlatformBrowser, NgIf, NgFor, AsyncPipe } from '@angular/common';
import { DataService } from 'src/app/portal/services/data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FilterService } from 'src/app/portal/services/filters/filter.service';
import { SortService } from 'src/app/portal/services/sort.service';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { ThousandSeparatorPipe } from '../../../../shared/pipes/thousand-separator.pipe';
import { NewsPaginationComponent } from '../news-pagination/news-pagination.component';
import { NewsCardComponent } from '../news-card/news-card.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { ActiveFiltersComponent } from '../../results/active-filters/active-filters.component';
import { SearchComponent } from '../../../../shared/components/search/search.component';
import { FiltersComponent } from '../../results/filters/filters.component';

@Component({
    selector: 'app-news-results',
    templateUrl: './news-results.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        NgIf,
        FiltersComponent,
        SearchComponent,
        ActiveFiltersComponent,
        MatProgressSpinner,
        NgFor,
        NewsCardComponent,
        NewsPaginationComponent,
        AsyncPipe,
        ThousandSeparatorPipe,
    ],
})
export class NewsResultsComponent
  implements OnInit, AfterViewInit, OnDestroy, OnChanges
{
  @Input() mobile: any;
  @Input() tab: any;

  data: any = [];

  errorMessage: any;

  @ViewChild('searchInput') searchInput: ElementRef;

  filterValues: unknown;
  filters: any;

  currentTerm: string;
  queryParams: any;

  routeSub: Subscription;
  inputSub: Subscription;
  focusSub: Subscription;
  olderNewsSub: Subscription;
  newsFiltersSub: Subscription;

  loading: boolean = false;

  constructor(
    public searchService: SearchService,
    @Inject(LOCALE_ID) protected localeId: string,
    private tabChangeService: TabChangeService,
    @Inject(PLATFORM_ID) private platformId: object,
    private dataService: DataService,
    private route: ActivatedRoute,
    private filterService: FilterService,
    private sortService: SortService,
    public utilityService: UtilityService,
    private router: Router
  ) {}

  ngOnInit() {
    this.routeSub = this.route.queryParams.subscribe((queryParams) => {
      this.queryParams = queryParams;

      if (queryParams.search) {
        this.searchService.updateInput(queryParams.search);
      } else {
        this.searchService.updateInput('');
      }

      // Update sort
      this.sortService.updateTab('news');

      this.searchService.updateNewsPageNumber(parseInt(queryParams.page));

      // Check for Angular Univeral SSR, get filters if browser
      if (isPlatformBrowser(this.platformId)) {
        this.filters = this.filterService.filterList(queryParams);
        this.filterService.updateFilters(this.filters);
      }

      // Get data
      if (this.tab === 1) {
        this.getData();
      }
    });

    // Search input handler
    this.inputSub = this.searchService.currentInput.subscribe(
      (input) => (this.currentTerm = input)
    );
  }

  ngOnChanges() {
    // Get data when tab changes first time
    if (!this.data.length && this.tab === 1 && this.queryParams) {
      this.getData();
    }
  }

  ngAfterViewInit() {
    // Focus with skip-links
    this.focusSub = this.tabChangeService.currentFocusTarget.subscribe(
      (target) => {
        if (target === 'search-input') {
          this.searchInput.nativeElement.focus();
        }
      }
    );
  }

  public setTitle(newTitle: string) {
    this.utilityService.setTitle(newTitle);
  }

  getData() {
    this.loading = true;
    this.getFilterNews();
    this.getFilterData();
  }

  getFilterNews(size: number = 5) {
    this.olderNewsSub = this.searchService
      .getOlderNews(size)
      .pipe(take(1))
      .subscribe({
        next: (data) => {
          this.data = data;
          this.loading = false;
        },
        error: (error) => (this.errorMessage = error as any),
      });
  }

  getFilterData() {
    // Check for Angular Univeral SSR, get filter data if browser
    if (isPlatformBrowser(this.platformId)) {
      this.newsFiltersSub = this.searchService.getNewsFilters().subscribe({
        next: (filterValues) => {
          this.filterValues = filterValues;
          // Send response to data service
          this.dataService.changeResponse(this.filterValues);
        },
        error: (error) => (this.errorMessage = error as any),
      });
    }
  }

  searchNews(term) {
    this.searchService.updateInput(term);
    const params = Object.assign({}, this.queryParams);
    params.search = term;
    this.router.navigate([], { queryParams: params });
    this.getFilterNews();
    this.getFilterData();
  }

  resetSearch() {
    this.currentTerm = '';
    this.searchService.updateInput('');
    const params = Object.assign({}, this.queryParams);
    params.search = null;
    this.router.navigate([], { queryParams: params });
  }

  ngOnDestroy() {
    this.tabChangeService.targetFocus('');
    this.inputSub?.unsubscribe();
    this.focusSub?.unsubscribe();
    this.olderNewsSub?.unsubscribe();
    this.newsFiltersSub?.unsubscribe();
    this.searchService.updateNewsPageNumber(1);
    this.tabChangeService.focus = undefined;
    this.searchService.updateInput('');
    if (this.filters) {
      this.filters.organization = [];
      this.filterService.updateFilters(this.filters);
    }
    this.routeSub?.unsubscribe();
  }
}
