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
} from '@angular/core';
import { SearchService } from 'src/app/portal/services/search.service';
import { Title } from '@angular/platform-browser';
import { TabChangeService } from 'src/app/portal/services/tab-change.service';
import { isPlatformBrowser } from '@angular/common';
import { DataService } from 'src/app/portal/services/data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FilterService } from 'src/app/portal/services/filters/filter.service';
import { SortService } from 'src/app/portal/services/sort.service';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-news-results',
  templateUrl: './news-results.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class NewsResultsComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() mobile: any;
  @Input() tab: any;

  data: any = [];

  errorMessage: any;

  @ViewChild('searchInput') searchInput: ElementRef;

  filterValues: unknown;
  filters: any;
  modalRef: BsModalRef;

  queryField: FormControl = new FormControl();

  currentTerm: string;
  queryParams: any;

  routeSub: Subscription;
  inputSub: Subscription;
  focusSub: Subscription;

  constructor(
    public searchService: SearchService,
    private titleService: Title,
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
      }

      // Check for Angular Univeral SSR, update filters if browser
      if (isPlatformBrowser(this.platformId)) {
        this.filterService.updateFilters(this.filters);
      }

      // Get data
      if (this.tab === 1) {
        this.getFilterNews();
        this.getFilterData();
      }
    });

    // Search input handler
    this.inputSub = this.searchService.currentInput.subscribe(
      (input) => (this.currentTerm = input)
    );
    this.queryField = new FormControl(this.currentTerm);
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
    this.titleService.setTitle(newTitle);
  }

  getFilterNews(size: number = 5) {
    this.searchService
      .getOlderNews(size)
      .pipe(take(1))
      .subscribe(
        (data) => {
          this.data = data;
        },
        (error) => (this.errorMessage = error as any)
      );
  }

  getFilterData() {
    // Check for Angular Univeral SSR, get filter data if browser
    if (isPlatformBrowser(this.platformId)) {
      this.searchService.getNewsFilters().subscribe(
        (filterValues) => {
          this.filterValues = filterValues;
          // Send response to data service
          this.dataService.changeResponse(this.filterValues);
        },
        (error) => (this.errorMessage = error as any)
      );
    }
  }

  searchNews() {
    const searchTerm = this.searchInput.nativeElement.value;
    this.searchService.updateInput(searchTerm);
    const params = Object.assign({}, this.queryParams);
    params.search = searchTerm;
    this.router.navigate([], { queryParams: params });
    this.getFilterNews();
    this.getFilterData();
  }

  resetSearch() {
    this.queryField.reset();
    this.searchInput.nativeElement.value = '';
    this.currentTerm = '';
    this.searchService.updateInput('');
    this.queryParams = null;
    const params = Object.assign({}, this.queryParams);
    params.search = null;
    this.router.navigate([], { queryParams: params });
  }

  ngOnDestroy() {
    this.tabChangeService.targetFocus('');
    this.inputSub?.unsubscribe();
    this.searchService.updateNewsPageNumber(1);
    this.tabChangeService.focus = undefined;
    this.searchService.updateInput('');
    if (this.filters) {
      this.filters.organization = [];
      this.filterService.updateFilters(this.filters);
    }
    this.routeSub?.unsubscribe();
  }

  closeModal() {
    this.modalRef.hide();
  }
}
