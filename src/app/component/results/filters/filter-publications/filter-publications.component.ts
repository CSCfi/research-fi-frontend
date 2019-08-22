//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef, OnChanges, ViewChildren, QueryList } from '@angular/core';
import { MatSelectionList } from '@angular/material';
import { Router } from '@angular/router';
import { SortService } from '../../../../services/sort.service';
import { ResizeService } from 'src/app/services/resize.service';
import { Subscription } from 'rxjs';
import { FilterService } from 'src/app/services/filter.service';

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
  @ViewChildren('selectedFields') selectedFields: QueryList<MatSelectionList>;
  @ViewChild('filterSidebar') filterSidebar: ElementRef;
  preSelection: any;

  private resizeSub: Subscription;
  yearFilters: any[];
  fieldOfScienceFilter: any;
  fields: any;
  filterTerm: string;

  majorFieldsOfScience = [
    {fieldId: 1, field: 'Luonnontieteet'},
    {fieldId: 2, field: 'Tekniikka'},
    {fieldId: 3, field: 'Lääke- ja yritystieteet'},
    {fieldId: 4, field: 'Maatalous- ja metsätieteet'},
    {fieldId: 5, field: 'Yhteiskuntatieteet'},
    {fieldId: 6, field: 'Humanistiset tieteet'},
    {fieldId: 9, field: 'Muut tieteet'}
  ];
  mappedFieldsofScience: any;
  combinedFields: any[];
  mergedFields: any;

  constructor( private router: Router, private filterService: FilterService, private resizeService: ResizeService,
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
    this.getSelected();
    this.router.navigate([],
    { queryParams: { page: 1, sort: this.sortService.sortMethod, year: this.yearFilters, field: this.fieldOfScienceFilter } });
  }

  selectAll(event, i) {
    this.selectedFields.toArray().forEach((item) => {
      console.log(item);
      switch (event.checked) {
        case  true: {
          item.selectAll();
          break;
        }
        default: {
          this.selectedFields.first.deselectAll();
          break;
        }
      }
    });
  }

  getSelected() {
    this.yearFilters = this.selectedYears.selectedOptions.selected.map(s => s.value);

    // Get minor fields of science from multiple selection lists
    const mergedFields = [];
    // Loop through child elements & check for map fields that have values
    this.selectedFields.forEach(child => {
      if (child.options.first && child.options.first.selectionList.selectedOptions.selected.length > 0) {
        // Push mapped values into array
        mergedFields.push(child.options.first.selectionList.selectedOptions.selected.map(s => s.value));
      }
     });
    // Merge arrays
    this.fieldOfScienceFilter = mergedFields.flat();
  }

  ngOnInit() {
    // Get preselected filters from filterService
    this.preSelection = [];
    const filters = this.filterService.currentFilters;
    Object.values(filters).flat().forEach(filter => this.preSelection.push(filter));

    this.resizeSub = this.resizeService.onResize$.subscribe(dims => this.onResize(dims));
  }

  // Wait for responseData and shape filter by term
  ngOnChanges() {
    this.responseData = this.responseData || [];
    this.filterTerm = this.filterTerm || '';
    const source = this.responseData[0] ? this.responseData[0].aggregations._index.buckets.publications.fieldsOfScience.buckets : [];
    this.fields = this.subFilter(source, this.filterTerm);
    this.separateMinor(source);
  }

  // Arrange fields by major
  separateMinor(source) {
    this.combinedFields = [];
    // Map fields by field & id
    if (source && source.length > 0) {
      this.mappedFieldsofScience = source.map(majorField => ({ field: majorField.key, id: majorField.fieldId.buckets[0].key }));
    }

    // Loop through major fields & push all instances as separate arrays
    for (let i = 1; i <= this.majorFieldsOfScience.length; i++) {
      if (i === 7) { i = 9; }
      if (this.mappedFieldsofScience) {
        this.combinedFields.push(this.mappedFieldsofScience.filter(obj => obj.id.toString().charAt(0).includes(i)));
      }
    }
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
    this.resizeSub.unsubscribe();
  }

}
