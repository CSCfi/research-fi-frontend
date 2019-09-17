import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FilterMethodService {
  majorFieldsOfScience = [
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
}
