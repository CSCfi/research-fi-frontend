//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef, OnChanges, ViewChildren, QueryList,
  ChangeDetectorRef, AfterViewInit, Inject, TemplateRef } from '@angular/core';
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
export class FiltersComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  @Input() responseData: any [];
  @Input() tabData: string;
  @ViewChildren('filterSelect') filterSelect: QueryList<MatSelectionList>;

  publicationFilterData = [
    {field: 'year', labelFi: 'Julkaisuvuosi', hasSubFields: false, open: true, limitHeight: true},
    {field: 'organization', labelFi: 'Organisaatio', hasSubFields: true, limitHeight: false},
    {field: 'field', labelFi: 'Tieteenala', hasSubFields: true, limitHeight: false},
    {field: 'publicationType', labelFi: 'Julkaisutyyppi', hasSubFields: true, limitHeight: false},
    {field: 'countryCode', labelFi: 'Julkaisumaa', hasSubFields: false, limitHeight: false},
    {field: 'languageCode', labelFi: 'Kieli', hasSubFields: false, limitHeight: false},
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

  constructor( private cdr: ChangeDetectorRef, private filterMethodService: FilterMethodService,
               private staticDataService: StaticDataService, private router: Router,
               private filterService: FilterService, private resizeService: ResizeService,
               @Inject(WINDOW) private window: Window, private modalService: BsModalService ) {
                this.height = 220;
                this.clickCount = 0;
                }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }

  closeModal() {
    this.modalRef.hide();
  }

  ngOnInit() {
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

      // Listen for changes in querylists
      // if (this.selectedFields) {
      //   this.selectedOrganizations.notifyOnChanges();
      //   this.selectedFields.notifyOnChanges();
      //   this.selectedPublicationTypes.notifyOnChanges();
      //   this.cdr.detectChanges();
      // }
    });
    this.resizeSub = this.resizeService.onResize$.subscribe(dims => this.onResize(dims));
  }

  ngOnDestroy() {
    this.filterSub.unsubscribe();
    this.resizeSub.unsubscribe();
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

  ngAfterViewInit() {

  }

  ngOnChanges() {
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

  onSelectionChange(filter) {
    this.parentPanel = filter;
    this.router.navigate([],
      { queryParams: this.getSelected(filter),
        queryParamsHandling: 'merge'
      });
  }


  getSelected(filter) {
    const selected = [];
    this.filterSelect.forEach(item => {
      if (item.selectedOptions.selected.length > 0) {
        console.log(item.selectedOptions.selected.map(s => s.value));
        selected[filter] = (item.selectedOptions.selected.map(s => isNaN(s.value) ? s.value.trim() : s.value));
      }
    });
    return selected;
  }

  resetHeight() {
    this.height = 220;
    this.clickCount = 0;
  }

  showMore(total) {
    this.clickCount++;
    total = total - 5 * this.clickCount;
    if (total < 5) {
      this.height = this.height + total * 48;
    } else {this.height = this.height + 220; }
  }

  shapeData() {
    this.responseData = this.responseData || [];

    if (this.responseData.length > 0) {
      const source = this.responseData[0].aggregations;
      // Major field of science
      // check if major aggregation is available
      const combinedMajorFields =  source.field ?
      (this.filterMethodService.separateMinor(source ? source.field.buckets : []) ) : [];

      const major = this.staticDataService.majorFieldsOfScience;
      for (let i = 0; i < combinedMajorFields.length; i++) {
        if (major[i]) {
          major[i].subData = combinedMajorFields[i];
        }
      }
      source.field.buckets = major;

      // Organization & sector
      this.organization(source.organization);
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
    return data;
  }

  minorField(data) {

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
