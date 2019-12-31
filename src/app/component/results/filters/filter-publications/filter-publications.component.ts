//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef, OnChanges, ViewChildren, QueryList,
         ChangeDetectorRef, AfterViewInit, Inject, TemplateRef } from '@angular/core';
import { MatSelectionList } from '@angular/material/list';
import { Router } from '@angular/router';
import { SortService } from '../../../../services/sort.service';
import { ResizeService } from '../../../../services/resize.service';
import { FilterService } from '../../../../services/filter.service';
import { FilterMethodService } from '../../../../services/filter-method.service';
import { StaticDataService } from '../../../../services/static-data.service';
import { DataService } from '../../../../services/data.service';
import { Subscription } from 'rxjs';
import { WINDOW } from 'src/app/services/window.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';

@Component({
  selector: 'app-filter-publications',
  templateUrl: './filter-publications.component.html',
  styleUrls: ['./filter-publications.component.scss']
})
export class FilterPublicationsComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  @Input() responseData: any [];
  @Input() tabData: string;
  panelOpenState: boolean;
  parentPanel: string;
  expandStatus: Array<boolean> = [];
  width = this.window.innerWidth;
  mobile = this.width < 992;
  @ViewChild('selectedYear', { static: false }) selectedYear: MatSelectionList;
  @ViewChild('selectedSector', { static: false }) selectedSector: MatSelectionList;
  @ViewChildren('selectedOrganization') selectedOrganization: QueryList<MatSelectionList>;
  @ViewChildren('selectedFields') selectedFields: QueryList<MatSelectionList>;
  @ViewChildren('selectedPublicationTypes') selectedPublicationTypes: QueryList<MatSelectionList>;
  @ViewChild('selectedCountryCode', { static: false }) selectedCountryCode: MatSelectionList;
  @ViewChild('selectedLang', { static: false }) selectedLang: MatSelectionList;
  @ViewChild('selectedJuFo', { static: false }) selectedJuFo: MatSelectionList;
  @ViewChild('selectedOpenAccess', { static: false }) selectedOpenAccess: MatSelectionList;
  preSelection = [];
  private resizeSub: Subscription;
  private filterSub: Subscription;

  yearFilter: any[];
  sectorFilter: any[];
  organizationFilter: any[];
  fieldOfScienceFilter: any;
  publicationTypeFilter: any;
  countryCodeFilter: any;
  langFilter: any;
  juFoFilter: any;
  openAccessFilter: any;

  fields: any;
  filterTerm: string;
  combinedMajorFields: any[];
  openAccessCodes: any[];
  filteredPublicationClass: any[];
  internationalCollab = false;
  panelHeight = '48px';
  public height: number;
  public clickCount: number;
  limitList = true;

  modalRef: BsModalRef;

  constructor( private router: Router, private filterService: FilterService, private resizeService: ResizeService,
               private sortService: SortService, private cdr: ChangeDetectorRef, private filterMethodService: FilterMethodService,
               private staticDataService: StaticDataService, private dataService: DataService,
               @Inject(WINDOW) private window: Window, private modalService: BsModalService) {
                  this.height = 240;
                  this.clickCount = 0;
                  // Set year filter to expanded as default
                  this.parentPanel = !this.parentPanel ? 'year' : undefined;
                }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }

  closeModal() {
    this.modalRef.hide();
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
    this.width = event.width;
    if (this.width >= 992) {
      this.mobile = false;
      // Modal existence check
      // tslint:disable-next-line: no-unused-expression
      this.modalRef && this.closeModal();
    } else {
      this.mobile = true;
    }
  }

  // Check parent and select all
  selectAll(event, i, filter) {
    const sector = this.selectedOrganization.toArray();
    const major = this.selectedFields.toArray();
    const typeClass = this.selectedPublicationTypes.toArray();

    switch (event.checked) {
      case true: {
        switch (filter) {
          case 'sector': {
            sector[i].selectAll();
            break;
          }
          case 'field': {
            major[i].selectAll();
            break;
          }
          case 'type': {
            typeClass[i].selectAll();
            break;
          }
        }
        break;
      }
      case false: {
        switch (filter) {
          case 'sector': {
            sector[i].deselectAll();
            break;
          }
          case 'field': {
            major[i].deselectAll();
            break;
          }
          case 'type': {
            typeClass[i].deselectAll();
            break;
          }
        }
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

  onSelectionChange() {
    this.getSelected();
    this.router.navigate([],
    { queryParams: { page: 1, sort: this.sortService.sortMethod, year: this.yearFilter, sector: this.sectorFilter,
      organization: this.organizationFilter, field: this.fieldOfScienceFilter, lang: this.langFilter,
      publicationType: this.publicationTypeFilter, countryCode: this.countryCodeFilter, juFo: this.juFoFilter,
      openAccess: this.openAccessFilter, internationalCollaboration: this.internationalCollab } });
  }

  getSelected() {
    this.yearFilter = this.selectedYear.selectedOptions.selected.map(s => s.value);
    // this.sectorFilter = this.selectedSector.selectedOptions.selected.map(s => s.value);
    // this.organizationFilter = this.selectedOrganization.selectedOptions.selected.map(s => s.value);
    this.countryCodeFilter = this.selectedCountryCode.selectedOptions.selected.map(s => s.value);
    this.langFilter = this.selectedLang.selectedOptions.selected.map(s => s.value);
    this.juFoFilter = this.selectedJuFo.selectedOptions.selected.map(s => s.value);
    this.openAccessFilter = this.selectedOpenAccess.selectedOptions.selected.map(s => s.value);
    // Use common filtering methods
    this.organizationFilter = this.filterMethodService.mergeChildren(this.selectedOrganization);
    this.fieldOfScienceFilter = this.filterMethodService.mergeChildren(this.selectedFields);
    this.publicationTypeFilter = this.filterMethodService.mergeChildren(this.selectedPublicationTypes);
    // If international collaboration is false, prevent param initalization
    if (!this.internationalCollab) {this.internationalCollab = null; }
  }

  ngOnInit() {
    // Subscribe to filterService filters
    this.filterSub = this.filterService.filters.subscribe(filters => {
      // Get preselected filters from filterService
      this.preSelection = [];
      if (filters.internationalCollaboration.length > 0) {this.internationalCollab = true; } else {this.internationalCollab = false; }
      Object.values(filters).flat().forEach(filter => this.preSelection.push(filter));

      // Listen for changes in querylists
      if (this.selectedFields) {
        this.selectedFields.notifyOnChanges();
        this.selectedPublicationTypes.notifyOnChanges();
      }
    });
    this.resizeSub = this.resizeService.onResize$.subscribe(dims => this.onResize(dims));
  }

  // Wait for responseData and shape filter by term
  ngOnChanges() {
    this.shapeData();
  }

  shapeData() {
    this.responseData = this.responseData || [];

    if (this.responseData.length > 0) {
      // check if major aggregation is available
      this.combinedMajorFields =
      this.responseData[0].aggregations.fieldsOfScience ? (this.filterMethodService.separateMinor(
        this.responseData[0] ? this.responseData[0].aggregations.fieldsOfScience.buckets : []) ) : [];
    }
    // Sub filter is for testing purposes. ToDo: Subfilter per parent if needed
    // this.filterTerm = this.filterTerm || '';
    // this.fields = this.filterMethodService.subFilter(
    //   this.responseData[0] ? this.responseData[0].aggregations.fieldsOfScience.buckets : [], this.filterTerm);

    this.separatePublicationClass();
    this.openAccess();
    this.cdr.detectChanges();
  }

  ngAfterViewInit() {
    this.filterMethodService.isChecked(this.selectedFields, 'majorFieldsOfScience');
    this.filterMethodService.isChecked(this.selectedPublicationTypes, 'publicationClass');
    this.parentSub();
  }

  // Manage checked status of parent field
  parentSub() {
    if (this.selectedFields) {
      this.selectedFields.changes.subscribe(() => {
        this.filterMethodService.isChecked(this.selectedFields, 'majorFieldsOfScience');
      });
    }
    if (this.selectedPublicationTypes) {
      this.selectedFields.changes.subscribe(() => {
        this.filterMethodService.isChecked(this.selectedPublicationTypes, 'publicationClass');
      });
    }
  }

  // Arrange publication type classes as parent classes (A, B, C...)
  separatePublicationClass() {
    const source = this.responseData[0] ? this.responseData[0].aggregations.publicationType.buckets : [];
    const combined = [];
    if (source && source.length > 0) {
      source.forEach(val => combined.push(val.key.substring(0, 1)));
      this.openAccessCodes = [];
      this.filteredPublicationClass = combined.filter((v, i, a) => a.indexOf(v) === i);
    }
  }

  // Open access
  openAccess() {
    const combined = [];
    // Get aggregation from response
    const source = this.responseData[0] ? this.responseData[0].aggregations.openAccess.buckets : [];
    if (source && source.length > 0) {
      source.forEach(val => combined.push(val.key));
      this.openAccessCodes = [];
      // Check for matching access codes. -1 & 9 are fallbacks from old data
      if (combined.includes(-1) || combined.includes(0) || combined.includes(9)) {this.openAccessCodes.push(
        {key: 0, label: 'Ei tietoa', value: 'noAccessInfo'}); }
      if (combined.includes(1)) {this.openAccessCodes.push({key: 1, label: 'Open access', value: 'openAccess'}); }
      if (combined.includes(2)) {this.openAccessCodes.push({key: 2, label: 'Hybridijulkaisu', value: 'hybridAccess'}); }
    }
  }

  // Get value from input inside filter
  filterInput(event) {
    this.filterTerm = event.target.value;
    this.ngOnChanges();
  }

  ngOnDestroy() {
    this.filterSub.unsubscribe();
    this.resizeSub.unsubscribe();
  }
}
