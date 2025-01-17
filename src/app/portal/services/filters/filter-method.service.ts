//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable } from '@angular/core';
import { StaticDataService } from '../static-data.service';

@Injectable({
  providedIn: 'root',
})
export class FilterMethodService {
  combined: any[];

  constructor(private staticDataService: StaticDataService) {}

  // Map minor fields of science to arrays by major
  separateMinor(source) {
    let mapped: any;
    const subFieldsMerged = [];
    this.combined = [];

    // Merge nested subfields of science
    if (source && source.length > 0) {
      source.forEach(item => {
        item.fieldId.buckets.forEach(fieldId => {
          subFieldsMerged.push({
            key: fieldId?.key.toString() || -1,
            label: item.key,
            // Invalid response if key is 0
            id: fieldId?.key || -1,
            doc_count: fieldId?.key
              // Separate logic for publications and datasets
              ? fieldId?.doc_count
              : -1,
          });
        });
      });
    }
    // Loop through major fields & push all instances as separate arrays
    this.staticDataService.majorFieldsOfScience.forEach((item) => {
        const i = item.id;
        if (subFieldsMerged) {
          this.combined.push(
            subFieldsMerged
              .filter((obj) => {
                return obj.id.toString().charAt(0).includes(String(i))
              })
              .filter((x) => x.doc_count > 0)
          );
        }
      }
    );
    return this.combined;
  }
}
