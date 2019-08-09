//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchService } from '../../../services/search.service';

@Component({
  selector: 'app-sort',
  templateUrl: './sort.component.html',
  styleUrls: ['./sort.component.scss']
})
export class SortComponent implements OnInit, OnDestroy {
  tabLink: string;
  tabFields: any;
  sortBy: string;
  queryParams: any;

  // Assign values to dropdown list by current tab
  publicationFields = [
    {label: 'Uusin ensin', value: 'desc'},
    {label: 'Vanhin ensin', value: 'asc'},
    {label: 'Julkaisun nimen mukaan (A-Ö)', value: 'name'},
    {label: 'Ensimmäisen tekijän mukaan (A-Ö)', value: 'person'}
  ]
  fundingFields = [
    {label: 'Uusin ensin', value: 'desc'},
    {label: 'Vanhin ensin', value: 'asc'},
    {label: 'Hankkeen nimen mukaan (A-Ö)', value: 'name'},
    {label: 'Rahoittajan mukaan (A-Ö)', value: 'funder'}
  ]

  constructor( private route: ActivatedRoute, private router: Router, private searchService: SearchService ) {
    // Get sort value from url, default to desc if undefined
    this.sortBy = this.route.snapshot.queryParams.sort;
    if (!this.sortBy) {this.sortBy = 'desc'; }
   }

  ngOnInit() {
    // Subscribe to current tab parameter
    this.queryParams = this.route.params.subscribe(params => {
      this.tabLink = params.tab;
      switch (this.tabLink) {
        case 'publications': {
          this.tabFields = this.publicationFields;
          break;
        }
        case 'fundings': {
          this.tabFields = this.fundingFields;
          break;
        }
      }
    });
  }

  // Send value to service and rewrite url
  orderBy(): void {
    this.searchService.getSortMethod(this.sortBy);
    this.navigate();
  }

  navigate() {
    this.router.navigate([],
      {
        relativeTo: this.route,
        queryParams: { sort: this.sortBy },
        queryParamsHandling: 'merge'
      });
  }

  ngOnDestroy() {
    this.queryParams.unsubscribe();
  }

}
