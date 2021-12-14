//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'getItemsBy',
})
export class GetItemsByPipe implements PipeTransform {
  transform(group: any, property: string) {
    const items = group.flatMap((groupItem) => groupItem.items);

    return items.filter((item) => item.itemMeta[property]);
  }
}
