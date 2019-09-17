//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FilterMethodService {
  public majorFieldsOfScience = [
    {fieldId: 1, field: 'Luonnontieteet', checked: false},
    {fieldId: 2, field: 'Tekniikka', checked: false},
    {fieldId: 3, field: 'Lääke- ja yritystieteet', checked: false},
    {fieldId: 4, field: 'Maatalous- ja metsätieteet', checked: false},
    {fieldId: 5, field: 'Yhteiskuntatieteet', checked: false},
    {fieldId: 6, field: 'Humanistiset tieteet', checked: false},
    {fieldId: 9, field: 'Muut tieteet', checked: false}
  ];

  combined: any[];

  constructor() { }

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
    // console.log(source);
    // Map fields by field & nested id
    if (source && source.length > 0) {
      mapped = source.map(majorField => ({ field: majorField.key, id: majorField.fieldId.buckets[0].key }));
    }

    // Loop through major fields & push all instances as separate arrays
    for (let i = 1; i < mapped.length; i++) {
      if (i === 7) { i = 9; }
      if (mapped) {
        this.combined.push(mapped.filter(obj => obj.id.toString().charAt(0).includes(i)));
      }
    }
    return this.combined;
  }

  isChecked(parent) {
    let objIndex: number;
    if (parent) {
      // Subscribe to selection lists
      parent.changes.subscribe(() => {
        const array = parent.toArray();
        for (let i = 0; i <= array.length - 1; i++) {
          // Compare sums of list and selection, change value of checked major, won't work without timeout
          setTimeout(() => {
            if (array[i].options.length > 0 && array[i].options.length === array[i].selectedOptions.selected.length) {
              objIndex = this.majorFieldsOfScience.findIndex((obj => obj.fieldId === i + 1));
              this.majorFieldsOfScience[objIndex].checked = true;
            } else {
              this.majorFieldsOfScience[i].checked = false;
            }
          }, 0);
        }
      });
    }
  }

  subFilter(source: any, term: string) {
    return source.filter(obj => obj.key.toLowerCase().includes(term.toLowerCase()));
  }
}
