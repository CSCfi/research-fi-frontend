//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'findByKeyValue',
})

/*
 * Usage:
 * {{ array | 'key': value }}
 *
 * E.g. in draft-summary-component where item is matched to items in patch payload
 */
export class FindByKeyValuePipe implements PipeTransform {
  transform(array: any[], key: string, value: string) {
    return array.find((item) => item[key] === value);
  }
}
