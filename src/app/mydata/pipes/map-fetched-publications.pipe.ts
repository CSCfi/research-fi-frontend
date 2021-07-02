//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Pipe, PipeTransform } from '@angular/core';
import { cloneDeep } from 'lodash-es';

@Pipe({
  name: 'mapFetchedPublications',
})

/*
 * Fetched publications have primaryValue as true. These publications need to be separated into dedicated list
 */
export class MapFetchedPublicationsPipe implements PipeTransform {
  transform(field: any) {
    const clone = cloneDeep(field);

    const groupItems = clone.flatMap((item) => item);

    for (const group of groupItems) {
      group.items = group.items.filter((item) => item.itemMeta.primaryValue);
    }

    return clone.flatMap((group) => group.items);
  }
}
