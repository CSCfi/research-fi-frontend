//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, ViewChild, ElementRef, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
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
  @Input() tabData: string;
  expandStatus: Array<boolean> = [];
  errorMessage = [];
  @ViewChild('singleId') singleId: ElementRef;
  @ViewChild('srHeader') srHeader: ElementRef;
  queryParams: any;
  filter: any;
  @Output() responseEvent = new EventEmitter<string>();
  filtersOn: boolean;

  constructor( private searchService: SearchService, private filterService: FilterService, private route: ActivatedRoute ) {
  }

  getFilters() {
    // Get Data and subscribe to url query parameters
    this.queryParams = this.route.queryParams.subscribe(params => {
      this.filter = [params.year, params.field];
      // Check if multiple filters selected and send to service
      if (Array.isArray(this.filter)) {
      this.filterService.getFilter(this.filter);
      } else if (this.filter !== undefined) {
        this.filterService.getFilter(this.filter);
      }

      // Maybe with switch statement to get more cleaner code
      if (this.filter[0] !== undefined && this.filter[0].length > 0 || this.filter[1] !== undefined && this.filter[1].length > 0) {
        this.filtersOn = true;
      } else {this.filtersOn = false; }

      // If selected filters, filtered API call
      if (this.filtersOn === true) {
        this.getFilteredData();
      } else {

      }
    });
  }

  ngOnInit() {
    this.getFilters();
  }

  // This gets called in pagination component, Assign results to publicationData
  getPublicationData() {
    // Check if url contains filter
    if (this.filtersOn === true) {
      this.filterService.filterData();
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
    this.filterService.filterData()
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
