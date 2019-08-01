//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef } from '@angular/core';
import { MatSelectionList } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { SearchService } from '../../../../services/search.service';
import { FilterService } from '../../../../services/filter.service';
import { ResizeService } from 'src/app/services/resize.service';
import { Subscription } from 'rxjs';
import { stringify } from 'querystring';

@Component({
  selector: 'app-filter-fundings',
  templateUrl: './filter-fundings.component.html',
  styleUrls: ['./filter-fundings.component.scss']
})
export class FilterFundingsComponent implements OnInit, OnDestroy {
  @Input() responseData: any [];
  @Input() tabData: string;
  panelOpenState: boolean;
  expandStatus: Array<boolean> = [];
  sidebarOpen = false;
  width = window.innerWidth;
  mobile = this.width < 992;
  @ViewChild('selectedYears') selectedYears: MatSelectionList;
  @ViewChild('filterSidebar') filterSidebar: ElementRef;
  @ViewChild('selectedFilters') selectedFilters: MatSelectionList;
  preSelection: any;
  tabLink: any;
  searchTerm: any;
  sortMethod: any;
  page: any;
  filters: any;
  filterArray: any [];

  private input: Subscription;
  private queryParams: Subscription;
  private resizeSub: Subscription;
  yearFilters: any[];
  statusFilter: any[];
  combinedFilters: any;

  constructor( private router: Router, private route: ActivatedRoute, private searchService: SearchService,
               private resizeService: ResizeService, private filterService: FilterService) { }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    if (this.sidebarOpen) {
      this.filterSidebar.nativeElement.style.display = 'block';
    } else {
      this.filterSidebar.nativeElement.style.display = 'none';
    }
  }

  onResize(event) {
    this.width = window.innerWidth;
    if (this.width >= 992) {
      this.mobile = false;
      if (!this.sidebarOpen) { this.toggleSidebar(); }
    } else {
      this.mobile = true;
      if (this.sidebarOpen) { this.toggleSidebar(); }
    }
  }

  onSelectionChange() {
    this.sortMethod = this.searchService.sortMethod;
    this.getSelected();
    this.router.navigate([],
    { queryParams: { page: 1, sort: this.sortMethod, year: this.yearFilters, status: this.statusFilter } });
  }

  getSelected() {
    this.statusFilter = this.selectedFilters.selectedOptions.selected.map(s => s.value);
    this.yearFilters = this.selectedYears.selectedOptions.selected.map(s => s.value);
    this.combinedFilters = this.statusFilter.concat(this.yearFilters);
    return this.combinedFilters;
  }

  ngOnInit() {
    // Subscribe to route parameters
    this.input = this.route.params.subscribe(params => {
      const term = params.input;
      this.searchTerm = term;
      this.tabLink = params.tab;
    });

    // Subscribe to query parameters and get data
    this.queryParams = this.route.queryParams.subscribe(params => {
      this.sortMethod = params.sort;
      this.page = params.page;
      this.filters = [params.year, params.status];
      // Pre select filters by url parameters
      if (this.filters !== undefined) {this.preSelection = JSON.stringify(this.filters); } else {this.preSelection = []; }
    });
    this.resizeSub = this.resizeService.onResize$.subscribe(dims => this.onResize(dims));


  }

  ngOnDestroy() {
    this.input.unsubscribe();
    this.queryParams.unsubscribe();
    this.resizeSub.unsubscribe();
  }

}

