//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable } from '@angular/core';
import { StaticDataService } from './static-data.service';

@Injectable({
  providedIn: 'root'
})
export class FilterMethodService {
  combined: any[];

  constructor( private staticDataService: StaticDataService) { }

  mergeChildren(source) {
    // Get data from viewChildren (multiple selection lists)
    const merged = [];
    // Loop through child elements & check for mapped fields that have values
    source.forEach(child => {
      if (child.options.first && child.options.first.selectionList.selectedOptions.selected.length > 0) {
        // Push mapped values into array
        merged.push(child.options.first.selectionList.selectedOptions.selected.map(s => s.value));
      }
     });
    return merged.flat();
  }

  separateMinor(source) {
    let mapped: any;
    this.combined = [];
    // Map fields by field & nested id
    if (source && source.length > 0) {
      mapped = source.map(majorField => ({
        key: majorField.fieldId.buckets[0]?.key || - 1,
        label: majorField.key,
        // Invalid response if key is 0
        id: majorField.fieldId.buckets[0]?.key || - 1,
        doc_count: majorField.fieldId.buckets[0]?.key ? majorField.fieldId.buckets[0].doc_count : - 1
      }));
    }
    // Loop through major fields & push all instances as separate arrays
    for (let i = 1; i < this.staticDataService.majorFieldsOfScience.length; i++) {
      if (i === 7) { i = 9; }
      if (mapped) {
        this.combined.push(mapped.filter(obj => obj.id.toString().charAt(0).includes(i)));
      }
    }
    return this.combined;
  }

  isChecked(parent, dataArray) {
    switch(dataArray) {
      case 'majorFieldsOfScience': {
        dataArray = this.staticDataService.majorFieldsOfScience;
        break;
      }
      case 'publicationClass': {
        dataArray = this.staticDataService.publicationClass;
        break;
      }
    }

    let objIndex: number;
    const array = parent.toArray();

    // Loop through items and find a match where selected items match parent item count
    for (const [i, item] of array.entries()) {
      setTimeout(() => {
        if (item.options.length > 0 && item.options.length === item.selectedOptions.selected.length) {
          objIndex = dataArray.findIndex((obj => obj.id === i + 1));
          dataArray[objIndex].checked = true;
        } else {
          dataArray[i].checked = false;
        }
      }, 0);
    }
  }

  subFilter(source: any, term: string) {
    return source.filter(obj => obj.key.toLowerCase().includes(term.toLowerCase()));
  }
}
