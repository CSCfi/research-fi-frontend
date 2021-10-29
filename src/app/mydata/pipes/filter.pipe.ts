//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
})

/*
 * Usage:
 * {{ item | filter: callback }}
 * Declare callback function in component
 */
export class FilterPipe implements PipeTransform {
  transform(
    value: any,
    callback: any,
    extras: { type: string; patchItemIds: string[] }
  ) {
    // Case for checking if group items match patch item array
    if (extras?.patchItemIds) {
      return value.filter(() => callback(value, extras.patchItemIds)) || [];
    }

    switch (extras?.type) {
      case 'boolean': {
        return !!(value.filter(callback).length > 0);
      }
      default: {
        return value.filter(callback);
      }
    }
  }
}
