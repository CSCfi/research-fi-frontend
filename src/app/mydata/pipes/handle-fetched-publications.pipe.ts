//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Pipe, PipeTransform } from '@angular/core';
import { FieldTypes } from '@mydata/constants/fieldTypes';
import { cloneDeep } from 'lodash-es';

@Pipe({
  name: 'handleFetchedPublications',
})

/*
 * Fetched publications have primaryValue as true. Publications from profile have their dedicated list.
 */
export class HandleFetchedPublicationsPipe implements PipeTransform {
  fieldTypes = FieldTypes;

  transform(groupItems: any, showFetched = false) {
    const publicationType = this.fieldTypes.activityPublication;

    if (groupItems[0].groupMeta.type === publicationType) {
      const groupItemsClone = cloneDeep(groupItems);
      for (const group of groupItemsClone) {
        group.items = group.items.filter((item) =>
          item.itemMeta.primaryValue === showFetched ? true : false
        );
      }
      return groupItemsClone;
    }

    return groupItems;
  }
}
