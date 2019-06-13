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
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit, OnDestroy {
  public searchTerm: any;
  input: any = [];
  tab: any = [];
  responseData: any [];
  errorMessage = [];
  pageNumber = 1;
  page: any;
  expandStatus: Array<boolean> = [];
  @ViewChild('singleId') singleId: ElementRef;
  @ViewChild('srHeader') srHeader: ElementRef;
  pageSub: any;

  constructor( private searchService: SearchService, private route: ActivatedRoute, private titleService: Title ) {
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
      // Defaults to 0 if no query param provided.
      this.page = +params.page || 1;
      this.searchService.getPageNumber(this.page);
    });

    // Subscribe to route input parameter, works with browser back & forward buttons
    this.input = this.route.params.subscribe(params => {
      const term = params.input;
      const tab = params.tab;
      this.searchTerm = term;
      this.tab = tab;
      this.searchService.getInput(this.searchTerm);
      // Get data
      this.getAllData();
    });

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
      // Set the title, pass a MatTabChange-like mock object to updateTitle() to avoid duplicate code
      this.updateTitle({tab: {textLabel: 'Julkaisut (' + this.responseData[0].aggregations._index.buckets.julkaisut.doc_count + ')'}});
    },
      error => this.errorMessage = error as any);
  }

  updateTitle(event: { tab: any; }) {
    // Update title and <h1> with the information of the currently selected tab
    // Regex to match the bracketed numbers
    const re: RegExp = /\((\d*)\)/;
    this.setTitle(event.tab.textLabel.replace(re, ' - ($1 hakutulosta)') + ' - Haku - Tutkimustietovaranto');
    this.srHeader.nativeElement.innerHTML = document.title.split(' - ', 2).join(' - ');
  }

  // Unsubscribe from search term to prevent memory leaks
  ngOnDestroy() {
    this.searchService.subsVar.unsubscribe();
    this.pageSub.unsubscribe();
  }

}
