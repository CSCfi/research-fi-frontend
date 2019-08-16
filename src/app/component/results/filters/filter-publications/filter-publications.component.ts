//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef, OnChanges } from '@angular/core';
import { MatSelectionList } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { SortService } from '../../../../services/sort.service';
import { ResizeService } from 'src/app/services/resize.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-filter-publications',
  templateUrl: './filter-publications.component.html',
  styleUrls: ['./filter-publications.component.scss']
})
export class FilterPublicationsComponent implements OnInit, OnDestroy, OnChanges {
  @Input() responseData: any [];
  @Input() tabData: string;
  panelOpenState: boolean;
  expandStatus: Array<boolean> = [];
  sidebarOpen = false;
  width = window.innerWidth;
  mobile = this.width < 992;
  @ViewChild('selectedYears') selectedYears: MatSelectionList;
  @ViewChild('selectedMajorFields') selectedMajorFields: MatSelectionList;
  @ViewChild('selectedFields') selectedFields: MatSelectionList;
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
  yearFilters: any[];
  fieldOfScienceFilter: any;
  majorFieldOfScienceFilter: any;
  fields: any;
  filtered: any;
  filterTerm: string;

  majorFieldsOfScience = [
    {fieldId: 1, field: 'Luonnontieteet'},
    {fieldId: 2, field: 'Tekniikka'},
    {fieldId: 3, field: 'Lääke- ja yritystieteet'},
    {fieldId: 4, field: 'Maatalous- ja metsätiteet'},
    {fieldId: 5, field: 'Yhteiskuntatieteet'},
    {fieldId: 6, field: 'Humanistiset tieteet'},
    {fieldId: 9, field: 'Muut tieteet'}
  ];

  constructor( private router: Router, private route: ActivatedRoute, private resizeService: ResizeService,
               private sortService: SortService ) { }

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
    this.getSelected();
    this.router.navigate([],
    { queryParams: { page: 1, sort: this.sortMethod, year: this.yearFilters, field: this.fieldOfScienceFilter } });
  }

  getSelected() {
    this.yearFilters = this.selectedYears.selectedOptions.selected.map(s => s.value);
    this.fieldOfScienceFilter = this.selectedFields.selectedOptions.selected.map(s => s.value);
    // this.majorFieldOfScienceFilter = this.selectedMajorFields.selectedOptions.selected.map(s => s.value);
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
      this.filters = [params.year, params.major, params.field];
      // Pre select filters by url parameters
      if (this.filters !== undefined) {this.preSelection = JSON.stringify(this.filters); } else {this.preSelection = []; }
    });
    this.resizeSub = this.resizeService.onResize$.subscribe(dims => this.onResize(dims));
  }

  // Wait for responeData and shape filter by term
  ngOnChanges() {
    this.responseData = this.responseData || [];
    this.filterTerm = this.filterTerm || '';
    const source = this.responseData[0] ? this.responseData[0].aggregations._index.buckets.publications.fieldsOfScience.buckets : [];
    this.fields = this.subFilter(source, this.filterTerm);
  }

  // Get value from input inside filter
  filterInput(event) {
    this.filterTerm = event.target.value;
    this.ngOnChanges();
  }

  // Search for term where values are in string format
  subFilter(array: any, term: string) {
    return array.filter(obj => obj.key.toLowerCase().includes(term.toLowerCase()));
  }

  ngOnDestroy() {
    this.input.unsubscribe();
    this.queryParams.unsubscribe();
    this.resizeSub.unsubscribe();
  }

}
