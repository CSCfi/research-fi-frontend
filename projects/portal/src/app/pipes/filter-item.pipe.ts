//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterItem',
  pure: false
})
// This pipe is used to set "Select all" checkbox
export class FilterItemPipe implements PipeTransform {
  transform(value: any, active: any): any {
    const arr = [];
    value.subData.forEach(item => {
      arr.push(item.key.toString());
    });

    // Check if filters are present in active filters
    if (value && active) {
      return (arr.every( e => active.includes(e) ));
    } else {
      return false;
    }

  }

}
