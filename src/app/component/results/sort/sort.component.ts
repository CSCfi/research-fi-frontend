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
  searchTerm: any;
  tabLink: any = [];
  page: any;
  sortBy = 'desc';
  input: any;
  sortMethod: string;
  queryParams: any;
  filters: any;
  tabFields: any;
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
    this.searchTerm = this.route.snapshot.params.input;
    this.sortMethod = this.route.snapshot.queryParams.sort;
    this.sortBy = this.route.snapshot.queryParams.sort;
    this.searchService.getSortMethod(this.sortMethod);
   }

  ngOnInit() {
    // If searchTerm is undefined, route doesn't work
    if (this.searchTerm === undefined) {
      this.searchTerm = '';
    }
    this.page = this.searchService.pageNumber;

    // Subscribe to route input parameter
    this.input = this.route.params.subscribe(params => {
      const term = params.input;
      this.searchTerm = term;
      this.tabLink = params.tab;
      // this.searchService.getInput(this.searchTerm);

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

    // Subscribe to query parameters and get data
    this.queryParams = this.route.queryParams.subscribe(params => {
      this.sortMethod = params.sort;
      this.page = params.page;
      this.filters = params.filter;
      if (this.sortMethod === undefined) {
        this.sortMethod = 'desc';
        this.searchService.getSortMethod(this.sortMethod);
      }
      this.sortBy = this.sortMethod;
      // this.searchService.getSortMethod(this.sortMethod);
    });

  }

  orderBy(): void {
    if (this.searchTerm ? undefined : this.searchTerm === '') {}
    this.searchService.sortMethod = this.sortBy;
    this.sortMethod = this.sortBy;
    this.searchService.getSortMethod(this.sortBy);
    this.navigate();

  }

  navigate() {
    if (this.searchTerm === undefined) {this. searchTerm = ''; }
    if (this.filters !== undefined) {
      this.router.navigate(['results/', this.tabLink, this.searchTerm],
      { queryParams: { page: 1, sort: this.sortMethod, filter: this.filters } });
    } else {
      this.router.navigate(['results/', this.tabLink, this.searchTerm],
      { queryParams: { page: 1, sort: this.sortMethod } });
    }
  }

  ngOnDestroy() {
    this.queryParams.unsubscribe();
  }

}
