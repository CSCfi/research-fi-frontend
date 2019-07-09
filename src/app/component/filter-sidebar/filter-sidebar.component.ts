//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, OnDestroy, Input, ViewChild } from '@angular/core';
import { MatSelectionList } from '@angular/material';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'app-filter-sidebar',
  templateUrl: './filter-sidebar.component.html',
  styleUrls: ['./filter-sidebar.component.scss']
})
export class FilterSidebarComponent implements OnInit, OnDestroy {
  @Input() responseData: any [];
  panelOpenState: boolean;
  expandStatus: Array<boolean> = [];
  sidebarOpen = false;
  mobile = window.innerWidth < 991;
  width = window.innerWidth;
  @ViewChild('selectedYears') selectedYears: MatSelectionList;
  input: any;
  tabLink: any;
  searchTerm: any;
  sortMethod: any;
  page: any;
  queryParams: any;
  selectedFilters: any[];
  filters: any;
  selected: any;
  preSelection: any;

  constructor( private router: Router, private route: ActivatedRoute, private searchService: SearchService ) { }

  toggleNavbar() {
    this.sidebarOpen = !this.sidebarOpen;
    const elem = document.getElementById('filter-sidebar');

    if (this.sidebarOpen) {
      elem.style.display = 'block';
    } else {
      elem.style.display = 'none';
    }
  }

  onResize(event) {
    const elem = document.getElementById('filter-sidebar');
    this.width = window.innerWidth;
    if (this.width >= 991) {
      elem.style.display = 'block';
    } else {
      elem.style.display = 'none';
    }
  }

  onSelectionChange() {
    this.sortMethod = this.searchService.sortMethod;
    // If searchTerm is undefined, route doesn't work
    if (this.searchTerm === undefined) {
      this.searchTerm = '';
    }

    this.router.navigate(['results/', this.tabLink, this.searchTerm],
    { queryParams: { page: this.page, sort: this.sortMethod, filter: this.getSelected() } });
  }

  getSelected() {
    // console.log(this.selectedYears.selectedOptions);
    return this.selectedYears.selectedOptions.selected.map(s => s.value);
  }

  ngOnInit() {
    // Subscribe to route parameters parameter
    this.input = this.route.params.subscribe(params => {
      const term = params.input;
      this.searchTerm = term;
      this.tabLink = params.tab;
    });

    // Subscribe to query parameters and get data
    this.queryParams = this.route.queryParams.subscribe(params => {
      this.sortMethod = params.sort;
      this.page = params.page;
      this.filters = params.filter;
      // console.log(this.selectedYears);
      // this.selectedYears.selectedOptions.selected.map = this.filters;
    });

    // Pre select filters by url parameters
    if (this.filters !== undefined) {this.preSelection = JSON.stringify(this.filters); } else {this.preSelection = []; }

  }

  ngOnDestroy() {
    // this.input.unsubsribe();
    // this.queryParams.unsubsribe();
  }

}
