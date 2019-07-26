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
import { ActivatedRoute, Router } from '@angular/router';

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

  constructor( private searchService: SearchService, private filterService: FilterService, private route: ActivatedRoute,
               private router: Router ) {
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
    this.filterService.filterPublications()
    .pipe(map(publicationData => [publicationData]))
    .subscribe(publicationData => {
      this.publicationData = publicationData;
    },
      error => this.errorMessage = error as any);
  }

  removeFilter(event): void {
    const filterParams = this.filter.filter(e => e !== event.target.id);

    this.router.navigate([], {
      queryParams: {
        filter: filterParams,
      },
      queryParamsHandling: 'merge'
    });
  }

  ngOnDestroy() {
    this.queryParams.unsubscribe();
  }
}
