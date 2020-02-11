//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, OnDestroy, Input, OnChanges, ViewChildren, QueryList,
  ChangeDetectorRef, Inject, TemplateRef, AfterContentChecked } from '@angular/core';
import { MatSelectionList } from '@angular/material/list';
import { Router, ActivatedRoute } from '@angular/router';
import { SortService } from '../../../../services/sort.service';
import { ResizeService } from '../../../../services/resize.service';
import { FilterService } from '../../../../services/filter.service';
import { FilterMethodService } from '../../../../services/filter-method.service';
import { StaticDataService } from '../../../../services/static-data.service';
import { DataService } from '../../../../services/data.service';
import { Subscription } from 'rxjs';
import { WINDOW } from 'src/app/services/window.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss']
})
export class FiltersComponent implements OnInit, OnDestroy, OnChanges, AfterContentChecked {
  @Input() responseData: any [];
  @Input() tabData: string;
  @ViewChildren('filterSelect') filterSelect: QueryList<MatSelectionList>;
  @ViewChildren('filterList') filterList: QueryList<MatSelectionList>;

  publicationFilterData = [
    {field: 'year', labelFi: 'Julkaisuvuosi', hasSubFields: false, open: true, limitHeight: true},
    {field: 'organization', labelFi: 'Organisaatio', hasSubFields: true, limitHeight: false},
    {field: 'field', labelFi: 'Tieteenala', hasSubFields: true, limitHeight: false},
    {field: 'publicationType', labelFi: 'Julkaisutyyppi', hasSubFields: true, limitHeight: false},
    {field: 'countryCode', labelFi: 'Julkaisumaa', hasSubFields: false, limitHeight: false},
    {field: 'lang', labelFi: 'Kieli', hasSubFields: false, limitHeight: true},
    {field: 'juFo', labelFi: 'Julkaisufoorumitaso', hasSubFields: false, limitHeight: false},
    {field: 'openAccess', labelFi: 'Avoin saatavuus', hasSubFields: false, limitHeight: false}
  ];

  publicationSingleFilterData = [
    {field: 'internationalCollaboration', labelFi: 'Kansainvälinen yhteisjulkaisu'}
  ];

  currentFilter: any[];
  currentSingleFilter: any[];
  panelOpenState: boolean;
  parentPanel: string;
  expandStatus: Array<boolean> = [];
  height: number;
  clickCount: number;
  preSelection = [];
  filterSub: any;
  resizeSub: any;
  width = this.window.innerWidth;
  mobile = this.width < 992;
  modalRef: BsModalRef;
  selectedFilters: any;
  selectedOptions: string[] = [];
  activeFilters: any;
  queryParamSub: Subscription;

  constructor( private cdr: ChangeDetectorRef, private filterMethodService: FilterMethodService,
               private staticDataService: StaticDataService, private router: Router,
               private filterService: FilterService, private resizeService: ResizeService,
               @Inject(WINDOW) private window: Window, private modalService: BsModalService,
               private route: ActivatedRoute ) {
                this.height = 220;
                this.clickCount = 0;
                this.selectedFilters = [];
                }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }

  closeModal() {
    this.modalRef.hide();
  }

  ngOnInit() {
    // Subscribe to queryParams
    this.queryParamSub = this.route.queryParams.subscribe(params => {
      this.activeFilters = params;
    });


    // Switch default open panel by index
    switch (this.tabData) {
      case 'publications': {
        this.parentPanel = 'year';
      }
    }

    // Subscribe to filterService filters
    this.filterSub = this.filterService.filters.subscribe(filters => {
      // Get preselected filters from filterService
      this.preSelection = [];
      // this.internationalCollab = filters.internationalCollaboration.length > 0 ? true : false;
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

  ngAfterContentChecked() {
    // Prevents ExpressionChangedAfterItHasBeenCheckedError
    this.selectedOptions = this.selectedOptions;
    this.cdr.detectChanges();
  }

  ngOnChanges() {
    // Initialize data and set filter data by index
    this.responseData = this.responseData || [];
    if (this.responseData.length > 0) {
      switch (this.tabData) {
        case 'publications': {
          this.currentFilter = this.publicationFilterData;
          this.currentSingleFilter = this.publicationSingleFilterData;
        }
      }
    }
    this.shapeData();
  }

  // Navigate
  selectionChange(filter, key) {
    // Set open panel
    this.parentPanel = filter;
    // Reset selected filters
    if (Object.entries(this.activeFilters).length === 0) {this.selectedFilters = []; }

    // If single preselected filter, transform value into array and pass active filter to selection.
    if (this.activeFilters[filter] && !Array.isArray(this.activeFilters[filter])) {
      const transformed = [];
      transformed[filter] = [this.activeFilters[filter]];
      this.activeFilters = transformed;
      this.selectedFilters = this.activeFilters;
    }

    // Remove
    if (this.selectedFilters[filter] && this.selectedFilters[filter].includes(key)) {
      this.selectedFilters[filter].splice( this.selectedFilters[filter].indexOf(key), 1 );
    } else {
      // Add new
      if (this.selectedFilters[filter] && this.selectedFilters[filter].length > 0) {
        this.selectedFilters[filter].push(key);
      } else {
        this.selectedFilters[filter] = [key];
      }
    }

    this.router.navigate([],
      { queryParams: this.selectedFilters,
        queryParamsHandling: 'merge'
      });
  }

  resetHeight() {
    this.height = 220;
    this.clickCount = 0;
  }

  showMore(total) {
    this.clickCount++;
    total = total - 5 * this.clickCount;
    this.height = total < 5 ? this.height + total * 48 : this.height = this.height * 2;
  }

  shapeData() {
    this.responseData = this.responseData || [];

    if (this.responseData.length > 0) {
      const source = this.responseData[0].aggregations;

      // Organization & sector
      this.organization(source.organization);
      // Major field
      source.field.buckets = this.minorField(source.field.buckets);
      // Publication Type
      source.publicationType.buckets = this.separatePublicationClass(source.publicationType.buckets);
      // Country code
      source.countryCode.buckets = this.publicationCountry(source.countryCode.buckets);
      // Jufo code
      source.juFo.buckets = this.juFoCode(source.juFo.buckets);
      // Open access
      source.openAccess.buckets = this.openAccess(source.openAccess.buckets);
      // Internationatl collaboration
      source.internationalCollaboration.buckets = this.getSingleAmount(source.internationalCollaboration.buckets);


    }
    this.cdr.detectChanges();
  }

  organization(data) {
    const org = data.sectorName;
    data.buckets = org.buckets;
    data.buckets.forEach(item => {
      item.subData = item.organizations.buckets;
      item.subData.map(subItem => {
        subItem.label = subItem.key;
        subItem.key = subItem.orgId.buckets[0].key;
      });
    });
  }

  minorField(data) {
      // check if major aggregation is available
      const combinedMajorFields =  data ?
      (this.filterMethodService.separateMinor(data ? data : []) ) : [];

      const result = this.staticDataService.majorFieldsOfScience;
      for (let i = 0; i < combinedMajorFields.length; i++) {
        if (result[i]) {
          result[i].subData = combinedMajorFields[i];
        }
      }
      return result;
  }

  separatePublicationClass(data) {
    const source = this.responseData[0] ? this.responseData[0].aggregations.publicationType.buckets : [];
    let combined = [];
    if (source && source.length > 0) {
      source.forEach(val => combined.push(val.key.substring(0, 1)));
      combined.filter((v, i, a) => a.indexOf(v) === i);
    }
    combined = [...new Set(combined)];
    const staticData = this.staticDataService.publicationClass;

    // Map items for subData
    const result = combined.map(
      x => x = {key: x + ', ' + staticData.find(item => item.class === x).label, subData: staticData.find(item => item.class === x)
        .types.map(type => type = {
          type: type.type,
          label: type.type + ', ' + type.label,
          key: type.type,
          doc_count: data.find(doc => doc.key === type.type) ? data.find(doc => doc.key === type.type).doc_count : ''
        })}
      );

    return result;
  }

  publicationCountry(data) {
    const result = data.map(item => item = {key: item.key === 0 ? 'Suomi' : 'Muu', doc_count: item.doc_count, value: item.key});
    return result;
  }

  juFoCode(data) {
    const staticData = this.staticDataService.juFoCode;
    const result = data.map(item => item = {
      key: staticData.find(code => code.key === item.key).labelFi,
      doc_count: item.doc_count,
      value: item.key
    });
    return result;
  }

  openAccess(data) {
    const combined = [];
    const openAccessCodes = [];
    let count = 0;
    // Get aggregation from response
    if (data && data.length > 0) {
      data.forEach(val => {
        // Sum up doc counts of no access info, -1 & 9 are fallbacks from old data
        if (val.key === -1 || val.key === 0 || val.key === 9) {
          count = count + val.doc_count;
        }
        switch (val.key) {
          case 1: {
            openAccessCodes.push({key: 'Avoin', doc_count: val.doc_count, label: 'Avoin', value: 'openAccess'});
            break;
          }
          case 2: {
            openAccessCodes.push({key: 'Ei avoin', doc_count: val.doc_count, label: 'Ei avoin', value: 'nonOpen'});
            break;
          }
        }
        combined.push(val.key);
      });
      // Check for matching access codes for no info
      if (combined.includes(-1) || combined.includes(0) || combined.includes(9)) {openAccessCodes.push(
        {key: 'Ei tietoa', doc_count: count, label: 'Ei tietoa', value: 'noAccessInfo'}); }
    }
    return openAccessCodes;
  }

  getSingleAmount(data) {
    if (data.length > 0) {
      return data.filter(x => x.key === 1);
    }
  }

}
