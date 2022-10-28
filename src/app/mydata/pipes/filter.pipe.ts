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
    extras: { type: string; patchItems: any[]; arg: string }
  ) {
    // Case for checking if group items match patch item array
    if (extras?.patchItems) {
      return value.filter(() => callback(value, extras.patchItems)) || [];
    }

    // E.g. data sources selection dialog where selection is filtered by status
    if (extras?.arg) {
      return callback(value, extras.arg);
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
