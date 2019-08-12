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
import { SortService } from '../../../../services/sort.service';
import { ResizeService } from 'src/app/services/resize.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-filter-persons',
  templateUrl: './filter-persons.component.html',
  styleUrls: ['./filter-persons.component.scss']
})
export class FilterPersonsComponent implements OnInit {
  @Input() responseData: any [];
  @Input() tabData: string;
  panelOpenState: boolean;
  expandStatus: Array<boolean> = [];
  sidebarOpen = false;
  width = window.innerWidth;
  mobile = this.width < 992;
  @ViewChild('selectedYears') selectedYears: MatSelectionList;
  @ViewChild('filterSidebar') filterSidebar: ElementRef;
  preSelection: any;
  tabLink: any;
  searchTerm: any;
  sortMethod: any;
  page: any;
  filters: any;

  private input: Subscription;
  private queryParams: Subscription;
  private resizeSub: Subscription;

  constructor( private router: Router, private route: ActivatedRoute, private searchService: SearchService,
               private resizeService: ResizeService, private sortService: SortService ) { }

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
    this.sortMethod = this.sortService.sortMethod;
    // If searchTerm is undefined, route doesn't work
    if (this.searchTerm === undefined) {
      this.searchTerm = '';
    }

    this.router.navigate(['results/', this.tabLink, this.searchTerm],
    { queryParams: { page: 1, sort: this.sortMethod, filter: this.getSelected() } });
  }

  getSelected() {
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
