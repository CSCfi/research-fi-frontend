//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'joinItems',
    standalone: true,
})
export class JoinItemsPipe implements PipeTransform {
  transform(items: any, key: string) {
    // Filter out empty strings if array of strings
    if (!items.find((item) => typeof item === 'object')) {
      items = items.filter((item) => item.length > 0);
    }

    return key ? items.map((item) => item[key]).join(', ') : items.join(', ');
  }
}
