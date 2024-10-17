//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filterSum',
    standalone: true,
})
export class FilterSumPipe implements PipeTransform {
  // Sum doc_count of filter options
  transform(value: any): any {
    let result = 0;
    value.forEach((item) => {
      result = result + item.doc_count;
    });
    return result;
  }
}
