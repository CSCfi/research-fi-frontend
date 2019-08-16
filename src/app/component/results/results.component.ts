//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, ViewChild, ElementRef, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef  } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { SearchService } from '../../services/search.service';
import { SortService } from '../../services/sort.service';
import { map } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { TabChangeService } from 'src/app/services/tab-change.service';
import { ResizeService } from 'src/app/services/resize.service';
import { FilterService } from 'src/app/services/filter.service';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit, OnDestroy, AfterViewInit {
  public searchTerm: any;
  input: any = [];
  tabData = this.tabChangeService.tabData;
  tabLink: any = [];
  selectedTabData: any = [];
  responseData: any [];
  errorMessage = [];
  pageNumber = 1;
  page: any;
  expandStatus: Array<boolean> = [];
  @ViewChild('singleId') singleId: ElementRef;
  @ViewChild('srHeader') srHeader: ElementRef;
  queryParams: any;
  filters: any;
  sortMethod: any;
  mobile: boolean;
  currentTab: any;
  updateFilters: boolean;
  total: any;

  constructor( private searchService: SearchService, private route: ActivatedRoute, private titleService: Title,
               private tabChangeService: TabChangeService, private router: Router, private resizeService: ResizeService,
               private sortService: SortService, private filterService: FilterService, private cdr: ChangeDetectorRef ) {
    this.searchTerm = this.route.snapshot.params.input;
    this.searchService.getInput(this.searchTerm);
  }

  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  ngOnInit() {


    // Subscribe to tab changes to update title
    this.currentTab = this.tabChangeService.currentTab.subscribe(tab => {
      // Prevent initialization from making an API-call
      if (tab.data.length > 0) {
        this.selectedTabData = tab;
        this.updateTitle(tab);
        this.sortService.getCurrentTab(tab.data);
        if (this.filters) {
          this.filterService.updateFilters(this.filters); // Temporary fix
        }
        this.getAllData();
      }
    });

    // Subscribe to queryParams and send to search service
    this.queryParams = this.route.queryParams.subscribe(params => {
      // Defaults to 1 if no query param provided.
      this.page = +params.page || 1;
      // filters is an object consisting of arrays, empty property arrays represent that no filter is enabled
      this.filters = {year: [params.year].flat().filter(x => x),
                      status: [params.status].flat().filter(x => x),
                      field: [params.field].flat().filter(x => x)};

      this.filterService.updateFilters(this.filters);
      this.sortService.getSortMethod(params.sort);
      this.searchService.getPageNumber(this.page);
      this.updateFilters = !this.updateFilters;
    });


    // Subscribe to route parameters, works with browser back & forward buttons
    this.input = this.route.params.subscribe(params => {
      const term = params.input;
      const previousTerm = this.searchTerm;
      this.tabLink = params.tab;
      this.searchTerm = term;
      // Get data only if search term changed
      if (previousTerm !== this.searchTerm) {
        this.getAllData();
      }
    });

    // Subscribe to resize
    this.resizeService.onResize$.subscribe(dims => this.updateMobile(dims.width));
    this.mobile = window.innerWidth < 992;

    // Get sort method and data on init
    this.sortMethod = this.route.snapshot.queryParams.sort;
    if (this.sortMethod === undefined) {this.sortMethod = 'desc'; }

    // this.getAllData();

    // If url is missing search term
    if (this.searchTerm === undefined) {
      this.searchTerm = '';
    }
  }

  // Get total value from search service / pagination
  ngAfterViewInit() {
    this.searchService.currentTotal.subscribe(total => {
      this.total = total || '';
      // Add thousand separators
      if (this.total) {this.total = total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
      this.cdr.detectChanges();
    });

  }

  navigateToVisualisation() {
    this.router.navigate(['visual/', this.route.snapshot.params.tab, this.searchTerm],
    {queryParams: this.filters});
  }

  getAllData() {
    this.searchService.getAllResults()
    .pipe(map(responseData => [responseData]))
    .subscribe(responseData => {
      this.responseData = responseData;
      // Set the title
      this.updateTitle(this.selectedTabData);
      // Switch to the tab with the most results if flag is set (new search)
      if (this.tabChangeService.directToMostHits) {
        const mostHits = {tab: 'publications', hits: 0};
        this.tabData.forEach(tab => {
          if (tab.data) {
            const hits = this.responseData[0].aggregations._index.buckets[tab.data].doc_count;
            if (hits > mostHits.hits) {
              mostHits.tab = tab.link;
              mostHits.hits = hits;
            }
          }
        });
        this.router.navigate(['results/', mostHits.tab, this.searchTerm]);
        this.tabChangeService.directToMostHits = false;
      }
    },
      error => this.errorMessage = error as any);
  }

  updateTitle(tab: { data: string; label: string}) {
    // Update title and <h1> with the information of the currently selected tab
    if (this.responseData) {
      // Placeholder until real data is available
      const amount = tab.data ? this.responseData[0].aggregations._index.buckets[tab.data].doc_count : 999;
      this.setTitle(tab.label + ' - (' + amount + ' hakutulosta) - Haku - Tutkimustietovaranto');
    }
    this.srHeader.nativeElement.innerHTML = document.title.split(' - ', 2).join(' - ');
  }

  updateMobile(width) {
    this.mobile = width < 992;
  }

  // Unsubscribe to prevent memory leaks
  ngOnDestroy() {
    this.queryParams.unsubscribe();
    this.currentTab.unsubscribe();
    this.input.unsubscribe();
  }

}
