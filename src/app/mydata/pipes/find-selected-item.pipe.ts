//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'findSelectedItem',
    standalone: true,
})
export class FindSelectedItemPipe implements PipeTransform {
  transform(items: any[]) {
    return !!items.map((item) => item.itemMeta).find((item) => item.show);
  }
}
