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

export class FundingFilters {
  filterData = [
      {field: 'year', labelFi: 'Aloitusvuosi', hasSubFields: false, open: true, limitHeight: true},
      {field: '', labelFi: 'Organisaatio', hasSubFields: false, limitHeight: false},
      {field: 'funder', labelFi: 'Rahoittaja', hasSubFields: false, limitHeight: false, open: true},
      {field: '', labelFi: 'Rahoitusmuoto', hasSubFields: false, limitHeight: false},
      {field: 'field', labelFi: 'Tieteenala', hasSubFields: true, limitHeight: false},
      {field: '', labelFi: 'Teema-ala', hasSubFields: false, limitHeight: false}
    ];

    singleFilterData = [
      {field: 'fundingStatus', labelFi: 'Näytä vain käynnissä olevat hankkeet'},
      // {field: 'internationalCollaboration', labelFi: 'Kansainvälinen yhteistyö'}
    ];

  constructor( private filterMethodService: FilterMethodService, private staticDataService: StaticDataService) {}

  shapeData(data) {
      const source = data[0].aggregations;
      // Funder
      source.funder.buckets = this.funder(source.funder.buckets)
      // Major field
      source.field.buckets = this.minorField(source.field.buckets);
      source.shaped = true;
      source.fundingStatus.buckets = this.onGoing(source.fundingStatus.buckets);
      console.log(source);
      return source;
  }

  funder(data) {
    const res = data.filter(item => {
      return item.key !== ' '
    })
    return res;
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

  onGoing(data) {
    return data.map(item => item.key = {key: 'onGoing', doc_count: item.doc_count});
  }

  getSingleAmount(data) {
      if (data.length > 0) {
        return data.filter(x => x.key === 1);
      }
    }
}
