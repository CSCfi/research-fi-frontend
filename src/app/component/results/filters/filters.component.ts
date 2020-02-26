//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, OnDestroy, Input, OnChanges, ViewChildren, QueryList,
  Inject, TemplateRef, ElementRef } from '@angular/core';
import { MatSelectionList } from '@angular/material/list';
import { Router, ActivatedRoute } from '@angular/router';
import { SortService } from '../../../services/sort.service';
import { ResizeService } from '../../../services/resize.service';
import { FilterService } from '../../../services/filter.service';
import { Subscription } from 'rxjs';
import { WINDOW } from 'src/app/services/window.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { UtilityService } from 'src/app/services/utility.service';

import { PublicationFilters } from './publications';
import { PersonFilters } from './persons';
import { FundingFilters } from './fundings';
import { InfrastructureFilters } from './infrastructures';
import { OrganizationFilters } from './organizations';
import { faSlidersH } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss']
})
export class FiltersComponent implements OnInit, OnDestroy, OnChanges {
  @Input() responseData: any [];
  @Input() tabData: string;
  @ViewChildren('filterSearch') filterSearch: QueryList<ElementRef>;

  currentFilter: any[];
  currentSingleFilter: any[];
  parentPanel: string;
  subPanel: string;
  height: number;
  preSelection = [];
  filterSub: any;
  resizeSub: any;
  width = this.window.innerWidth;
  mobile = this.width < 992;
  modalRef: BsModalRef;
  selectedFilters: any;
  activeFilters: any;
  queryParamSub: Subscription;
  subFilters: MatSelectionList[];
  totalCount = 0;
  faSlidersH = faSlidersH;
  panelHeight = 'auto';
  panelArr = [];
  showMoreCount: any;
  filterTerm: any;
  shapedData: any;

  constructor( private router: Router, private filterService: FilterService,
               private resizeService: ResizeService, @Inject(WINDOW) private window: Window, private modalService: BsModalService,
               private route: ActivatedRoute, private utilityService: UtilityService, private sortService: SortService,
               private publicationFilters: PublicationFilters, private personFilters: PersonFilters,
               private fundingFilters: FundingFilters, private infrastructureFilters: InfrastructureFilters,
               private organizationFilters: OrganizationFilters ) {
                this.selectedFilters = [];
                this.showMoreCount = [];
                }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }

  closeModal() {
    this.modalRef.hide();
  }

  preventTab(event) {
    UtilityService.preventTab(event);
  }

  preventTabBack(event) {
    UtilityService.preventTabBack(event, this.utilityService.modalOpen);
  }

  ngOnInit() {
    // Subscribe to queryParams
    this.queryParamSub = this.route.queryParams.subscribe(params => {
      this.activeFilters = params;
      // Reset selected filters
      if (Object.entries(this.activeFilters).length === 0) {this.selectedFilters = []; }
    });

    // Switch default open panel by index
    switch (this.tabData) {
      case 'publications': {
        this.parentPanel = 'year';
        break;
      }
      case 'persons': {
        this.parentPanel = '';
        break;
      }
      case 'fundings': {
        this.parentPanel = 'year';
        break;
      }
      case 'infrastructures': {
        this.parentPanel = '';
        break;
      }
      case 'organizations': {
        this.parentPanel = 'sector';
        break;
      }
    }

    // Subscribe to filterService filters
    this.filterSub = this.filterService.filters.subscribe(filters => {
      // Get preselected filters from filterService
      this.preSelection = [];
      Object.values(filters).flat().forEach(filter => this.preSelection.push(filter));
    });
    this.resizeSub = this.resizeService.onResize$.subscribe(dims => this.onResize(dims));
  }

  ngOnDestroy() {
    this.filterSub.unsubscribe();
    this.resizeSub.unsubscribe();
    this.queryParamSub.unsubscribe();
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

  ngOnChanges() {
    // Initialize data and set filter data by index
    this.responseData = this.responseData || [];
    if (this.responseData.length > 0) {
      // Set filters and shape data
      switch (this.tabData) {
        case 'publications': {
          this.currentFilter = this.publicationFilters.filterData;
          this.currentSingleFilter = this.publicationFilters.singleFilterData;
          if (!this.responseData[0].aggregations.shaped && !this.shapedData) {
            this.publicationFilters.shapeData(this.responseData);
            this.shapedData = this.responseData;
          }
          break;
        }
        case 'persons': {
          this.currentFilter = this.personFilters.filterData;
          this.currentSingleFilter = this.personFilters.singleFilterData;
          if (!this.responseData[0].aggregations.shaped && !this.shapedData) {
            this.personFilters.shapeData(this.responseData);
            this.shapedData = this.responseData;
          }
          break;
        }
        case 'fundings': {
          this.currentFilter = this.fundingFilters.filterData;
          this.currentSingleFilter = this.fundingFilters.singleFilterData;
          if (!this.responseData[0].aggregations.shaped && !this.shapedData) {
            this.fundingFilters.shapeData(this.responseData);
            this.shapedData = this.responseData;
          }
          break;
        }
        case 'infrastructures': {
          this.currentFilter = this.infrastructureFilters.filterData;
          this.currentSingleFilter = this.infrastructureFilters.singleFilterData;
          if (!this.responseData[0].aggregations.shaped && !this.shapedData) {
            this.infrastructureFilters.shapeData(this.responseData);
            this.shapedData = this.responseData;
          }
          break;
        }
        case 'organizations': {
          this.currentFilter = this.organizationFilters.filterData;
          this.currentSingleFilter = this.organizationFilters.singleFilterData;
          if (!this.responseData[0].aggregations.shaped && !this.shapedData) {
            this.organizationFilters.shapeData(this.responseData);
            this.shapedData = this.responseData;
          }
          break;
        }
      }
    }
  }

  // Navigate
  selectionChange(filter, key) {
    // Key comes as an array from selectAll method, single selects are strings
    if (Array.isArray(key)) {
      this.selectedFilters[filter] = key;
      // this.selectedFilters[filter].length > 0 ? this.selectedFilters[filter].concat(key)
    } else {
      // Filters cause problems if different data types
      key = key.toString();
      // Transform single active filter into array
      if (this.activeFilters[filter] && !Array.isArray(this.activeFilters[filter])) {
        const transformed = [];
        transformed[filter] = [this.activeFilters[filter]];
        this.activeFilters = transformed;
        this.selectedFilters = this.activeFilters;
      }
      // Merge selection with active filters
      if (this.activeFilters[filter]) {
        const combined = this.activeFilters[filter].concat(this.selectedFilters[filter] ? this.selectedFilters[filter] : []);
        this.selectedFilters[filter] = [...new Set(combined)];
      }

      // Remove filter if selection exists
      if (this.selectedFilters[filter] && this.selectedFilters[filter].includes(key)) {
        this.selectedFilters[filter].splice(this.selectedFilters[filter].indexOf(key), 1);
      } else {
        // Add new filter
        if (this.selectedFilters[filter] && this.selectedFilters[filter].length > 0) {
          this.selectedFilters[filter].push(key);
        } else {
          this.selectedFilters[filter] = [key];
        }
      }
    }
    // Set sort and page
    this.selectedFilters.sort = this.sortService.sortMethod;
    this.selectedFilters.page = 1;

    this.router.navigate([],
      { queryParams: this.selectedFilters,
        queryParamsHandling: 'merge'
      });
  }

  selectAll(filter, subFilter) {
    // Push subfilter items into array
    const itemArr = [];
    subFilter.subData.forEach(item => {
      itemArr.push(item.key);
    });
    let result = [];

    // Check if all items already selected
    if (this.activeFilters[filter]) {
      const allSelected = (itemArr.every(value => this.activeFilters[filter].indexOf(value) >= 0));
      // 
      result = [...new Set(this.activeFilters[filter])];
      if (allSelected) {
        // Remove all from active
        itemArr.forEach(item => result.splice(result.indexOf(item), 1));
      } else {
        // Add all new selections and remove duplicates
        result.push(...itemArr);
        result = [...new Set(result)];
      }
    } else {
      result = itemArr;
    }
    // Pass selection

    this.selectionChange(filter, result);
  }

  filterInput(event, parent) {
    const term = event.target.value.length > 0 ? event.target.value.toLowerCase() : '';
    const source = this.shapedData[0].aggregations[parent];
    source.original = source.original ? source.original : source.buckets;
    const matchArr = source.original.filter(item => (item.label ? item.label : item.key).toString().toLowerCase().includes(term));
    if (matchArr.length > 0) {
      source.buckets = matchArr;
      this.showMoreCount[parent] = {count: term.length ? matchArr.length : 3};
    } else {
      source.buckets = [];
      this.showMoreCount[parent] = {count: 3};
    }
    // Set term per parent
    source.filterTerm = term;
  }

  subFilterInput(event, parent, child) {
    const term = event.target.value.length > 0 ? event.target.value.toLowerCase() : '';
    // this.filterTerm = term;
    const source = this.shapedData[0].aggregations[parent].buckets.find(sub => sub.key === child);
    source.original = source.original ? source.original : source.subData;
    const matchArr = source.original.filter(subItem => subItem.label.toLowerCase().includes(term));
    if (matchArr.length > 0) {
      source.subData = matchArr;
      this.showMoreCount[child] = {count: term.length ? matchArr.length : 3};
    } else {
      source.subData = [];
      this.showMoreCount[child] = {count: 3};
    }
    // Set term per parent
    source.filterTerm = term;
  }

  setOpenStatus(parent) {
    this.currentFilter.find(item => item.field === parent).open = true;
  }

  closePanel(parent) {
    this.currentFilter.find(item => item.field === parent).open = false;
  }

  showMore(parent) {
    this.showMoreCount[parent] = this.showMoreCount[parent] ? {count: this.showMoreCount[parent].count + 3} : {count: 6};
  }

  showLess(parent) {
    this.showMoreCount[parent] =  {count: this.showMoreCount[parent].count - 3};
  }

  trackByFn(index: any, item: any) {
    return index;
  }

}
