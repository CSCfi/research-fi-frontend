//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hasSelectedItems',
})
export class HasSelectedItemsPipe implements PipeTransform {
  transform(data: any): boolean {
    if (data?.length) {
      return data.some((group) => group.items.find((el) => el.itemMeta.show));
    } else if (data?.items) {
      return data.items.some((item) => item.itemMeta.show);
    } else return false;
  }
}
