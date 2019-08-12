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
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-publications',
  templateUrl: './publications.component.html',
  styleUrls: ['./publications.component.scss']
})
export class PublicationsComponent implements OnInit, OnDestroy {
  publicationData: any [];
  @Input() tabData: string;
  expandStatus: Array<boolean> = [];
  errorMessage = [];
  @ViewChild('singleId') singleId: ElementRef;
  @ViewChild('srHeader') srHeader: ElementRef;
  filterSub: Subscription;
  filter: any;
  @Output() responseEvent = new EventEmitter<string>();
  filtersOn: boolean;

  constructor( private searchService: SearchService, private filterService: FilterService, private route: ActivatedRoute ) {
  }

  getFilters() {
    // Get Data and subscribe to url query parameters
    this.filterSub = this.filterService.filters.subscribe(filter => {
      this.filter = filter;

      // Check if any filters are selected
      Object.keys(this.filter).forEach(key => this.filtersOn = this.filter[key].length > 0 || this.filtersOn);

      // Get data
      this.getPublicationData();
    });
  }

  ngOnInit() {
    this.getFilters();
  }

  // Get publication data, check if filtered or all data
  getPublicationData() {
    // Check if url contains filter
    (this.filtersOn ? this.searchService.filterData() :
                      this.searchService.getAllResults())
    .pipe(map(publicationData => [publicationData]))
    .subscribe(publicationData => this.publicationData = publicationData,
                error => this.errorMessage = error as any);
  }

  ngOnDestroy() {
    this.filterSub.unsubscribe();
  }
}
