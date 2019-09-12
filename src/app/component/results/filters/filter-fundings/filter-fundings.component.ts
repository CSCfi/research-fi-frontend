//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef } from '@angular/core';
import { MatSelectionList } from '@angular/material';
import { Router } from '@angular/router';
import { SortService } from '../../../../services/sort.service';
import { FilterService } from '../../../../services/filter.service';
import { ResizeService } from 'src/app/services/resize.service';
import { Subscription } from 'rxjs';

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
  panelHeight = '48px';
  @ViewChild('filterSidebar') filterSidebar: ElementRef;
  @ViewChild('selectedYears') selectedYears: MatSelectionList;
  @ViewChild('selectedStatus') selectedStatus: MatSelectionList;
  preSelection: any;

  private resizeSub: Subscription;
  private filterSub: Subscription;
  yearFilters: any[];
  statusFilter: any[];
  combinedFilters: any;

  constructor( private router: Router, private filterService: FilterService,
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
    this.getSelected();
    this.router.navigate([],
    { queryParams: { sort: this.sortService.sortMethod, year: this.yearFilters, status: this.statusFilter } });
  }

  getSelected() {
    this.statusFilter = this.selectedStatus.selectedOptions.selected.map(s => s.value);
    this.yearFilters = this.selectedYears.selectedOptions.selected.map(s => s.value);
    this.combinedFilters = this.statusFilter.concat(this.yearFilters);
    return this.combinedFilters;
  }

  ngOnInit() {
    // Subscribe to filter service filters
    this.filterSub = this.filterService.filters.subscribe(filters => {
      // Get preselected filters from filterService
      this.preSelection = [];
      Object.values(filters).flat().forEach(filter => this.preSelection.push(filter));
    });
    this.resizeSub = this.resizeService.onResize$.subscribe(dims => this.onResize(dims));
  }

  ngOnDestroy() {
    this.resizeSub.unsubscribe();
    this.filterSub.unsubscribe();
  }

}

