//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'joinItems',
})
export class JoinItemsPipe implements PipeTransform {
  transform(items: any, key: string) {
    return key ? items.map((item) => item[key]).join(', ') : items.join(', ');
  }
}
