//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'joinValues',
})

/*
 * Find match for values and return joined string
 */
export class JoinValuesPipe implements PipeTransform {
  transform(items: any, fields: string[], locale: string) {
    const arr = [];

    fields.forEach((field) => {
      items[field + locale] && arr.push(items[field + locale]);
    });

    return arr.join(', ');
  }
}
