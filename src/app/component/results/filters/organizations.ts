//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { FilterMethodService } from '../../../services/filter-method.service';
import { StaticDataService } from '../../../services/static-data.service';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
  })

export class OrganizationFilters {
  filterData = [
    {field: 'sector', labelFi: 'Organisaatio', hasSubFields: false, limitHeight: false, open: true},
  ];

  singleFilterData = [
    {field: 'internationalCollaboration', labelFi: 'Kansainvälinen yhteisjulkaisu'}
  ];

  constructor( private filterMethodService: FilterMethodService, private staticDataService: StaticDataService) {}

  shapeData(data) {
    const source = data[0].aggregations;
    source.sector.buckets = this.sector(source.sector.buckets);
    return source;
  }

  sector(data) {
    const result =  data.map(item => item = {label: item.key, key: item.sectorId.buckets[0].key, doc_count: item.doc_count});
    return result;
  }


  getSingleAmount(data) {
    if (data.length > 0) {
      return data.filter(x => x.key === 1);
    }
  }
}
