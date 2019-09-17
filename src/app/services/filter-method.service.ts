import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FilterMethodService {

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
}
