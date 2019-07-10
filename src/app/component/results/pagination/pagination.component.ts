//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, Output, EventEmitter, Input, OnDestroy } from '@angular/core';
import { SearchService } from '../../../services/search.service';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnInit, OnDestroy {
  page: any;
  fromPage: number;
  searchTerm: any;
  tabLink: any = [];
  @Output() queryEvent = new EventEmitter<string>();
  @Input() responseData: any [];
  input: any;
  sortMethod: string;
  paginationCheck: boolean;
  routerEvent: any;
  queryParams: any;
  filters: any;

  constructor( private searchService: SearchService, private route: ActivatedRoute, private router: Router ) {
    this.searchTerm = this.route.snapshot.params.input;
    this.paginationCheck = this.searchService.requestCheck;
   }

  getData() {
    this.queryEvent.emit('');
  }

  ngOnInit() {
    // If searchTerm is undefined, route doesn't work
    if (this.searchTerm ? undefined : this.searchTerm === '') {}

    // Subscribe to route parameters parameter
    this.input = this.route.params.subscribe(params => {
      const term = params.input;
      this.searchTerm = term;
      this.tabLink = params.tab;
      this.searchService.getInput(this.searchTerm);
    });

    // Subscribe to route events and get data
    this.routerEvent = this.router.events.pipe(
    filter(event => event instanceof NavigationEnd))
    .subscribe(() => {
        this.getData();
    });

    // Subscribe to query parameters and get data
    this.queryParams = this.route.queryParams.subscribe(params => {
      this.sortMethod = params.sort;
      this.page = params.page;
      this.filters = params.filter;
    });

    // Reset pagination
    this.page = this.searchService.pageNumber;

    // Pagination number
    this.fromPage = this.page * 10 - 10;
  }

  nextPage() {
    this.page++;
    this.fromPage = this.page * 10 - 10;
    this.searchService.getPageNumber(this.page);
    this.searchTerm = this.route.snapshot.params.input;
    this.sortMethod = this.searchService.sortMethod;
    // If searchTerm is undefined, route doesn't work
    if (this.searchTerm === undefined) {
      this.searchTerm = '';
    }
    this.navigate();
    this.paginationCheck = true;
  }

  previousPage() {
    this.page--;
    this.fromPage = this.fromPage - 10;
    this.searchService.getPageNumber(this.page);
    this.searchTerm = this.route.snapshot.params.input;
    this.sortMethod = this.searchService.sortMethod;
    // If searchTerm is undefined, route doesn't work
    if (this.searchTerm === undefined) {
      this.searchTerm = '';
      this.paginationCheck = false;
    }
    this.navigate();
    this.paginationCheck = true;
  }

  navigate() {
    if (this.filters !== undefined) {
      this.router.navigate(['results/', this.tabLink, this.searchTerm],
      { queryParams: { page: this.page, sort: this.sortMethod, filter: this.filters } });
    } else {
      this.router.navigate(['results/', this.tabLink, this.searchTerm],
      { queryParams: { page: this.page, sort: this.sortMethod } });
    }
  }

  ngOnDestroy() {
    this.input.unsubscribe();
    this.routerEvent.unsubscribe();
    this.queryParams.unsubscribe();
  }

}
