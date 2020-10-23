//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable } from '@angular/core';
import { StaticDataService } from '../static-data.service';

@Injectable({
  providedIn: 'root'
})
export class FilterMethodService {
  combined: any[];

  constructor( private staticDataService: StaticDataService) { }

  // Map minor fields of science to arrays by major
  separateMinor(source) {
    let mapped: any;
    this.combined = [];
    // Map fields by field & nested id
    if (source && source.length > 0) {
      mapped = source.map(majorField => ({
        key: majorField.fieldId.buckets[0]?.key.toString() || - 1,
        label: majorField.key,
        // Invalid response if key is 0
        id: majorField.fieldId.buckets[0]?.key || - 1,
        doc_count: majorField.fieldId.buckets[0]?.key ? majorField.filtered.filterCount.doc_count : - 1
      }));
    }
    // Loop through major fields & push all instances as separate arrays
    for (let i = 1; i < this.staticDataService.majorFieldsOfScience.length; i++) {
      if (i === 7) { i = 9; }
      if (mapped) {
        this.combined.push(mapped.filter(obj => obj.id.toString().charAt(0).includes(i)).filter(x => x.doc_count > 0));
      }
    }
    return this.combined;
  }

}
