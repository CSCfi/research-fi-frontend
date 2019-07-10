//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, ViewChild, ElementRef, OnInit, OnDestroy, Input } from '@angular/core';
import { SearchService } from '../../../services/search.service';
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
  paginationCheck: boolean;

  constructor( private searchService: SearchService, private route: ActivatedRoute ) {
    // Check if http request is POST or GET
    this.paginationCheck = this.searchService.requestCheck;
  }

  dataSource(): string {
    return this.paginationCheck ? this.publicationData[0].hits.hits :
                                  this.publicationData[0].aggregations._index.buckets[this.tabData].index_results.hits.hits;
  }

  ngOnInit() {
    // Get Data and subscripe to url query parameters
    this.queryParams = this.route.queryParams.subscribe(this.queryParams);
  }

  // Assign results to publicationData
  getPublicationData() {
    this.paginationCheck = true;
    this.searchService.getPublications()
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
