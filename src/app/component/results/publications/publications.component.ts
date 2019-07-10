//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, ViewChild, ElementRef, OnInit, OnDestroy, Input } from '@angular/core';
import { SearchService } from '../../../services/search.service';
import { FilterService } from '../../../services/filter.service';
import { map } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-publications',
  templateUrl: './publications.component.html',
  styleUrls: ['./publications.component.scss']
})
export class PublicationsComponent implements OnInit, OnDestroy {
  @Input() publicationData: any [];
  expandStatus: Array<boolean> = [];
  errorMessage = [];
  @ViewChild('singleId') singleId: ElementRef;
  @ViewChild('srHeader') srHeader: ElementRef;
  queryParams: any;
  paginationCheck: boolean;
  filter: any;
  selectedFilters: any[];
  selectedYears: any;
  selectedYear: any;

  constructor( private searchService: SearchService, private filterService: FilterService, private route: ActivatedRoute ) {
    // Check if http request is POST or GET
    this.paginationCheck = this.searchService.requestCheck;
    this.selectedFilters = [];
  }

  getFilters() {
    // Get Data and subscribe to url query parameters
    this.queryParams = this.route.queryParams.subscribe(params => {
      this.filter = params.filter;
      // Check if multiple filters selected and send to service
      if (Array.isArray(this.filter)) {
      this.filterService.getFilter(this.filter);
      } else if (this.filter !== undefined) {
        this.filterService.getFilter(this.filter);
      }

      if (this.filter !== undefined && this.filter.length > 0) {
        this.getFilteredData();
        this.paginationCheck = true;
      } else {
        // this.getPublicationData();
      }
    });
  }

  ngOnInit() {
    this.getFilters();
  }

  // Assign results to publicationData
  getPublicationData() {
    this.paginationCheck = false;
    // Check if url contains filter
    if (this.filter !== undefined && this.filter.length > 0) {
      this.filterService.filterPublications();
    } else {
      this.searchService.getAllResults()
      .pipe(map(publicationData => [publicationData]))
      .subscribe(publicationData => {
        this.publicationData = publicationData;
      },
        error => this.errorMessage = error as any);
    }
  }

  getFilteredData() {
    this.paginationCheck = true;
    this.filterService.filterPublications()
    .pipe(map(publicationData => [publicationData]))
    .subscribe(publicationData => {
      this.publicationData = publicationData;
    },
      error => this.errorMessage = error as any);
  }

  ngOnDestroy() {
    this.queryParams.unsubscribe();
  }
}
