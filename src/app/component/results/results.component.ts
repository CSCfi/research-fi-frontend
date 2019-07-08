//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { SearchService } from '../../services/search.service';
import { map } from 'rxjs/operators';
import { ActivatedRoute, Router} from '@angular/router';
import { TabChangeService } from 'src/app/services/tab-change.service';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit, OnDestroy {
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
  pageSub: any;

  constructor( private searchService: SearchService, private route: ActivatedRoute, private titleService: Title,
               private tabChangeService: TabChangeService, private router: Router ) {
    this.searchTerm = this.route.snapshot.params.input;
    this.searchService.getInput(this.searchTerm);
  }

  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  ngOnInit() {
    // Subscribe to route page number
    this.pageSub = this.route
    .queryParams
    .subscribe(params => {
      // Defaults to 1 if no query param provided.
      this.page = +params.page || 1;
      this.searchService.getPageNumber(this.page);
    });

    // Subscribe to tab changes to update title
    this.tabChangeService.currentTab.subscribe(tab => { this.selectedTabData = tab; this.updateTitle(tab); });

    // Subscribe to route parameters, works with browser back & forward buttons
    this.input = this.route.params.subscribe(params => {
      const term = params.input;
      const previousTerm = this.searchTerm;
      this.tabLink = params.tab;
      this.searchTerm = term;
      this.searchService.getInput(this.searchTerm);
      // Get data only if search term changed
      if (previousTerm !== this.searchTerm) {
        this.getAllData();
      }
    });

    // Get data on init
    this.getAllData();

    // If url is missing search term, might not be necessary
    if (this.searchTerm === undefined) {
      this.searchTerm = '';
    }

    // Listen for search button action on results page
    if (this.input !== null || this.searchService.subsVar === undefined) {
      this.searchService.subsVar = this.searchService.
      invokeGetData.subscribe(() => {
        // Reset pagination
        this.page = 1;
        this.searchService.getPageNumber(1);
      });
    }
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
    // Reset request check
    this.searchService.requestCheck = false;
  }

  // Unsubscribe from search term to prevent memory leaks
  ngOnDestroy() {
    this.searchService.subsVar.unsubscribe();
    this.pageSub.unsubscribe();
  }

}
