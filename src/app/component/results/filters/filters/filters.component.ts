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
  @ViewChildren('subFilterSelect') subFilterSelect: QueryList<MatSelectionList>;
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
  maxHeight = 220;
  subFilters: MatSelectionList[];
  totalCount = 0;

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
      // Reset selected filters
      if (Object.entries(this.activeFilters).length === 0) {this.selectedFilters = []; }
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

    // Subfilter array is used to mark subFilters as checked
    this.subFilters = this.subFilterSelect.toArray();
  }

  // Navigate
  selectionChange(filter, key) {
    // Set open panel
    this.parentPanel = filter;
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

    this.router.navigate([],
      { queryParams: this.selectedFilters,
        queryParamsHandling: 'merge'
      });
  }


  selectAll(event, filter, subFilter) {
    const index = event.source.value;
    const arr = this.subFilterSelect.toArray();
    const itemArr = [];
    // Push filter items into array, this is used to remove filters from active
    subFilter.subData.forEach(item => {
      itemArr.push(item.key);
    });

    const options = [];
    let result = [];
    switch (event.checked) {
      case true: {
        arr[index].selectAll();
        arr[index].options.forEach(option => {
          options.push(option.value);
        });
        // Merge selected with active filters
        result = this.activeFilters[filter] ? this.activeFilters[filter].concat(options) : options;
        break;
      }
      case false: {
        arr[index].deselectAll();
        // Remove deselected filters
        result = this.activeFilters[filter].filter(val => !itemArr.includes(val));
        break;
      }
    }
    // Pass selection
    this.selectionChange(filter, result);
  }

  resetHeight() {
    this.height = this.maxHeight;
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
      source.openAccess.buckets = this.openAccess(source.openAccess.buckets, source.selfArchived.buckets);
      // Internationatl collaboration
      source.internationalCollaboration.buckets = this.getSingleAmount(source.internationalCollaboration.buckets);
      // console.log(source);
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
    const result = data.map(item =>
      item = {key: 'c' + item.key, label: item.key === 0 ? 'Suomi' : 'Muu', doc_count: item.doc_count, value: item.key});
    return result;
  }

  juFoCode(data) {
    const staticData = this.staticDataService.juFoCode;
    const result = data.map(item => item = {
      key: item.key === ' ' ? 'noVal' : 'j' + item.key,
      label: staticData.find(code => code.key === item.key).labelFi,
      doc_count: item.doc_count,
      value: item.key
    });
    return result;
  }

  openAccess(openAccess, selfArchived) {
    let openAccessCodes = [];
    const result = [];
    // Get aggregation from response
    if (openAccess && openAccess.length > 0) {
      openAccess.forEach(val => {
        switch (val.key) {
          case 1: {
            openAccessCodes.push({key: 'openAccess', doc_count: val.doc_count, label: 'Open Access -lehti'});
            break;
          }
          case 2: {
            openAccessCodes.push({key: 'otherOpen', doc_count: val.doc_count, label: 'Muu avoin saatavuus'});
            break;
          }
          case 0: {
            openAccessCodes.push({key: 'nonOpenAccess', doc_count: val.doc_count, label: 'Ei avoin'});
            break;
          }
          default: {
            openAccessCodes.push({key: 'noOpenAccessData', doc_count: val.doc_count, label: 'Ei tietoa'});
            break;
          }
        }
      });
    }
    if (selfArchived && selfArchived.length > 0) {
      selfArchived.forEach(val => {
        switch (val.key) {
          case 1: {
            openAccessCodes.push({key: 'selfArchived', doc_count: val.doc_count, label: 'Rinnakkaistallennettu'});
            break;
          }
          case 0: {
            openAccessCodes.push({key: 'selfArchivedNonOpen', doc_count: val.doc_count, label: 'Ei avoin'});
            break;
          }
          default: {
            openAccessCodes.push({key: 'noOpenAccessData', doc_count: val.doc_count, label: 'Ei tietoa'});
            break;
          }
        }
      });
    }

    // Get duplicate values and sum doc counts
    const reduce = openAccessCodes.reduce((item, val) => {
      const sum = item.filter((obj) => {
          return obj.key === val.key;
      }).pop() || {key: val.key, doc_count: 0, label: val.label};

      sum.doc_count += val.doc_count;
      item.push(sum);
      return item;
    }, []);

    // Remove duplicates
    openAccessCodes = [...new Set(reduce)];

    function docCount(key) {return openAccessCodes.find(item => item.key === key).doc_count; }

    // Push items by key
    if (openAccessCodes.some(e => e.key === 'openAccess')) {
      result.push({key: 'openAccess', doc_count: docCount('openAccess'), label: 'Open Access -lehti'});
    }
    if (openAccessCodes.some(e => e.key === 'otherOpen')) {
      result.push({key: 'otherOpen', doc_count: docCount('otherOpen'), label: 'Rinnakkaistallennettu'});
    }
    if (openAccessCodes.some(e => e.key === 'selfArchived')) {
      result.push({key: 'selfArchived', doc_count: docCount('selfArchived'), label: 'Muu avoin saatavuus'});
    }
    if (openAccessCodes.some(e => e.key === 'nonOpenAccess') && openAccessCodes.some(e => e.key === 'selfArchivedNonOpen')) {
      result.push({key: 'nonOpen', doc_count: Math.max(docCount('nonOpenAccess'), docCount('selfArchivedNonOpen')),  label: 'Ei avoin'});
    }
    if (openAccessCodes.some(e => e.key === 'noOpenAccessData')) {
      result.push({key: 'noOpenAccessData', doc_count: docCount('noOpenAccessData'), label: 'Ei tietoa'});
    }

    return result;
  }

  getSingleAmount(data) {
    if (data.length > 0) {
      return data.filter(x => x.key === 1);
    }
  }

}
