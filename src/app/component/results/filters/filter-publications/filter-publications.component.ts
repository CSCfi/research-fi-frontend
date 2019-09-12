//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef, OnChanges, ViewChildren, QueryList,
         ChangeDetectorRef, AfterViewInit } from '@angular/core';
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
export class FilterPublicationsComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  @Input() responseData: any [];
  @Input() tabData: string;
  panelOpenState: boolean;
  expandStatus: Array<boolean> = [];
  sidebarOpen = false;
  width = window.innerWidth;
  mobile = this.width < 992;
  @ViewChild('selectedYears') selectedYears: MatSelectionList;
  @ViewChildren('selectedFields') selectedFields: QueryList<MatSelectionList>;
  @ViewChild('selectedJuFo') selectedJuFo: MatSelectionList;
  @ViewChild('selectedOpenAccess') selectedOpenAccess: MatSelectionList;
  @ViewChild('filterSidebar') filterSidebar: ElementRef;
  preSelection = [];

  private resizeSub: Subscription;
  private filterSub: Subscription;
  yearFilters: any[];
  fieldOfScienceFilter: any;
  juFoFilter: any;
  openAccessFilter: any;
  fields: any;
  filterTerm: string;

  majorFieldsOfScience = [
    {fieldId: 1, field: 'Luonnontieteet', checked: false},
    {fieldId: 2, field: 'Tekniikka', checked: false},
    {fieldId: 3, field: 'Lääke- ja yritystieteet', checked: false},
    {fieldId: 4, field: 'Maatalous- ja metsätieteet', checked: false},
    {fieldId: 5, field: 'Yhteiskuntatieteet', checked: false},
    {fieldId: 6, field: 'Humanistiset tieteet', checked: false},
    {fieldId: 9, field: 'Muut tieteet', checked: false}
  ];

  publicationClass = [
    {id: 1, class: 'A'},
    {id: 2, class: 'B'},
    {id: 3, class: 'C'},
    {id: 4, class: 'D'},
    {id: 5, class: 'G'},
    {id: 6, class: 'F'}
  ];

  mappedFieldsofScience: any;
  combinedFields: any[];
  mergedFields: any;
  openAccessCodes: any[];
  internationalCollab = false;
  panelHeight = '48px';
  public height: number;
  public clickCount: number;
  limitList = true;

  constructor( private router: Router, private filterService: FilterService, private resizeService: ResizeService,
               private sortService: SortService, private cdr: ChangeDetectorRef ) {
                 this.height = 240;
                 this.clickCount = 0;
                }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    if (this.sidebarOpen) {
      this.filterSidebar.nativeElement.style.display = 'block';
    } else {
      this.filterSidebar.nativeElement.style.display = 'none';
    }
  }

  resetHeight() {
    this.height = 240;
    this.clickCount = 0;
  }

  showMore(total) {
    this.clickCount++;
    total = total - 5 * this.clickCount;
    if (total < 5) {
      this.height = this.height + total * 48;
    } else {this.height = this.height + 240; }
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
    { queryParams: { page: 1, sort: this.sortService.sortMethod, year: this.yearFilters, field: this.fieldOfScienceFilter,
      juFo: this.juFoFilter, openAccess: this.openAccessFilter, internationalCollaboration: this.internationalCollab } });
  }

  // Select all from major
  selectAll(event, i) {
    const major = this.selectedFields.toArray();
    switch (event.checked) {
      case  true: {
        major[i].selectAll();
        break;
      }
      default: {
        major[i].deselectAll();
        break;
      }
    }
    this.onSelectionChange();
  }

  // Single checkbox
  singleSelect(event) {
    if (event.checked) {this.internationalCollab = true; } else {this.internationalCollab = null; }
    this.onSelectionChange();
  }

  getSelected() {
    // If international collaboration is false, prevent param initalization
    if (!this.internationalCollab) {this.internationalCollab = null; }
    this.yearFilters = this.selectedYears.selectedOptions.selected.map(s => s.value);
    this.juFoFilter = this.selectedJuFo.selectedOptions.selected.map(s => s.value);
    this.openAccessFilter = this.selectedOpenAccess.selectedOptions.selected.map(s => s.value);

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
    // Subscribe to filter service filters
    this.filterSub = this.filterService.filters.subscribe(filters => {
      // Get preselected filters from filterService
      this.preSelection = [];
      if (filters.internationalCollaboration.length > 0) {this.internationalCollab = true; } else {this.internationalCollab = false; }
      Object.values(filters).flat().forEach(filter => this.preSelection.push(filter));

      // Listen for changes in querylist
      if (this.selectedFields) {
        this.selectedFields.notifyOnChanges();
      }
    });

    this.resizeSub = this.resizeService.onResize$.subscribe(dims => this.onResize(dims));
  }

  ngAfterViewInit() {
    this.isChecked();
  }

  // Wait for responseData and shape filter by term
  ngOnChanges() {
    this.responseData = this.responseData || [];
    this.filterTerm = this.filterTerm || '';
    const source = this.responseData[0] ? this.responseData[0].aggregations.fieldsOfScience.buckets : [];
    this.fields = this.subFilter(source, this.filterTerm);
    this.separateMinor(source);
    this.openAccess();
    this.cdr.detectChanges();
  }

  // Find fields where all items are checked and change checked status of majors in majorFieldsOfScience array of objects
  isChecked() {
    let objIndex: number;
    if (this.selectedFields) {
      // Subscribe to selection lists
      this.selectedFields.changes.subscribe(() => {
        const array = this.selectedFields.toArray();
        for (let i = 0; i <= array.length - 1; i++) {
          // Compare sums of list and selection, change value of checked major, won't work without timeout
          setTimeout(() => {
            if (array[i].options.length > 0 && array[i].options.length === array[i].selectedOptions.selected.length) {
              objIndex = this.majorFieldsOfScience.findIndex((obj => obj.fieldId === i + 1));
              this.majorFieldsOfScience[objIndex].checked = true;
            } else {
              this.majorFieldsOfScience[i].checked = false;
            }
          }, 0);
        }
      });
    }
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

  // Open access
  openAccess() {
    const combined = [];
    // Get aggregation from response
    const source = this.responseData[0] ? this.responseData[0].aggregations.openAccess.buckets : [];
    if (source && source .length > 0) {
      source.forEach(val => combined.push(val.key));
      this.openAccessCodes = [];
      // Check for matching access codes. -1 & 9 are fallbacks from old data
      if (combined.includes(-1) || combined.includes(0) || combined.includes(9)) {this.openAccessCodes.push(
        {key: 0, label: 'Ei vastausta', value: 'noAccessInfo'}); }
      if (combined.includes(1)) {this.openAccessCodes.push({key: 1, label: 'Open access', value: 'openAccess'}); }
      if (combined.includes(2)) {this.openAccessCodes.push({key: 2, label: 'Hybridijulkaisu', value: 'hybridAccess'}); }
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
    this.filterSub.unsubscribe();
    this.resizeSub.unsubscribe();
  }

}
