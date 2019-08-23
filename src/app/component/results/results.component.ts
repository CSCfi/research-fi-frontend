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
import { Subscription } from 'rxjs';

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
  selectedTabData: any = [];
  responseData: any [];
  errorMessage = [];
  pageNumber = 1;
  page: any;
  expandStatus: Array<boolean> = [];
  @ViewChild('singleId') singleId: ElementRef;
  @ViewChild('srHeader') srHeader: ElementRef;
  queryParams: Subscription;
  filters: {year: any[], status: any[], field: any[], internationalCollaboration: any[]};
  mobile: boolean;
  updateFilters: boolean;
  total: any;
  totalSub: any;

  constructor( private searchService: SearchService, private route: ActivatedRoute, private titleService: Title,
               private tabChangeService: TabChangeService, private router: Router, private resizeService: ResizeService,
               private sortService: SortService, private filterService: FilterService, private cdr: ChangeDetectorRef ) {
    this.searchTerm = this.route.snapshot.params.input;
    this.searchService.updateInput(this.searchTerm);
  }

  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  ngOnInit() {
    // Subscribe to queryParams and send to search service
    this.queryParams = this.route.queryParams.subscribe(params => {
      // Defaults to 1 if no query param provided.
      this.page = +params.page || 1;
      // filters is an object consisting of arrays, empty property arrays represent that no filter is enabled
      this.filters = {year: [params.year].flat().filter(x => x),
                      status: [params.status].flat().filter(x => x),
                      field: [params.field].flat().filter(x => x),
                      internationalCollaboration: [params.internationalCollaboration].flat().filter(x => x)};

      this.filterService.updateFilters(this.filters);
      this.sortService.updateSort(params.sort);
      this.searchService.getPageNumber(this.page);
      // Flag telling search-results to fetch new filtered data
      this.updateFilters = !this.updateFilters;
    });


    // Subscribe to route parameters, works with browser back & forward buttons
    this.input = this.route.params.subscribe(params => {
      this.searchTerm = params.input || '';
      this.searchService.updateInput(this.searchTerm);

      const previousTab = this.tab;
      this.tab = params.tab;

      if (previousTab !== this.tab) {
        this.selectedTabData = this.tabData.filter(tab => tab.link === this.tab)[0];
        this.updateTitle(this.selectedTabData);
        this.sortService.updateTab(this.selectedTabData.data);
        this.filterService.updateFilters(this.filters);
        this.tabChangeService.changeTab(this.selectedTabData);
      }

      this.getAllData();
    });

    // Subscribe to resize
    this.resizeService.onResize$.subscribe(dims => this.updateMobile(dims.width));
    this.mobile = window.innerWidth < 992;
  }

  // Get total value from search service / pagination
  ngAfterViewInit() {
    this.totalSub = this.searchService.currentTotal.subscribe(total => {
      this.total = total || '';
      // Add thousand separators
      if (this.total) {this.total = total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
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
        // Reduce buckets to the one with the most results
        const buckets = this.responseData[0].aggregations._index.buckets;
        const mostHits = Object.keys(buckets).reduce((best, index) => {
          best = best.hits < buckets[index].doc_count ? {tab: index, hits: buckets[index].doc_count} : best;
          return best;
        }, {tab: 'publications', hits: 0});
        this.router.navigate(['results/', mostHits.tab, this.searchTerm || ''], {replaceUrl: true});
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
    this.tabChangeService.changeTab({data: '', label: '', link: ''});
    this.searchService.updateInput('');
    this.queryParams.unsubscribe();
    this.input.unsubscribe();
    this.totalSub.unsubscribe();
  }

}
