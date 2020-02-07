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

  publicationFilterData = [
    {field: 'years', labelFi: 'Julkaisuvuosi', hasSubFields: false},
    {field: 'sector', labelFi: 'Organisaatio', hasSubFields: true},
    {field: 'fieldsOfScience', labelFi: 'Tieteenala', hasSubFields: true},
    {field: 'publicationType', labelFi: 'Julkaisutyyppi', hasSubFields: true},
    {field: 'countryCode', labelFi: 'Julkaisumaa', hasSubFields: false},
    {field: 'languageCode', labelFi: 'Kieli', hasSubFields: false},
    {field: 'juFo', labelFi: 'Julkaisufoorumitaso', hasSubFields: false},
    {field: 'openAccess', labelFi: 'Avaoin saatavuus', hasSubFields: false},
    {field: 'sector', labelFi: 'Kansainvälinen yhteisjulkaisu', hasSubFields: false}

  ];

  currentFilter: any[];

  constructor( private cdr: ChangeDetectorRef, private filterMethodService: FilterMethodService,
               private staticDataService: StaticDataService ) { }

  ngOnInit() {

  }

  ngOnDestroy() {

  }

  ngAfterViewInit() {

  }

  ngOnChanges() {
    this.responseData = this.responseData || [];

    if (this.responseData.length > 0) {
      const aggs = this.responseData[0].aggregations;
      // console.log(aggs);
      switch (this.tabData) {
        case 'publications': {
          this.currentFilter = this.publicationFilterData;
        }
      }
    }

    this.shapeData();
  }

  shapeData() {
    this.responseData = this.responseData || [];

    if (this.responseData.length > 0) {
      const source = this.responseData[0].aggregations;
      // Major field of science
      // check if major aggregation is available
      const combinedMajorFields =  source.fieldsOfScience ?
      (this.filterMethodService.separateMinor(source ? source.fieldsOfScience.buckets : []) ) : [];

      const major = this.staticDataService.majorFieldsOfScience;
      for (let i = 0; i < combinedMajorFields.length; i++) {
        if (major[i]) {
          major[i].subData = combinedMajorFields[i];
        }
      }
      source.fieldsOfScience.buckets = major;

      // Organization & sector
      const org = source.sector.sectorName;
      source.sector.buckets = org.buckets;
      source.sector.buckets.forEach(item => {
        item.subData = item.organizations.buckets;
      });

      // Publication Type
      source.publicationType.buckets = this.separatePublicationClass(source.publicationType.buckets);
      console.log(source);
    }

    this.cdr.detectChanges();
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
          label: type.label,
          key: type.type + ', ' + type.label,
          doc_count: data.find(doc => doc.key === type.type) ? data.find(doc => doc.key === type.type).doc_count : ''
        })}
      );

    return result;
  }

}
