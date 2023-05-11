//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Pipe, PipeTransform } from '@angular/core';
import { FieldTypes } from '@mydata/constants/fieldTypes';
import { ItemMeta } from 'src/types';

@Pipe({
  name: 'isPortalItem',
})

// Usage (item.itemMeta | isPortalItem)
// E.g. in profile items table to determine when delete row button is displayed
export class IsPortalItemPipe implements PipeTransform {
  transform(item: { itemMeta: ItemMeta; dataSources: any[] }) {
    const portalTypes = [
      FieldTypes.activityPublication,
      FieldTypes.activityDataset,
      FieldTypes.activityFunding,
      FieldTypes.activityActivitiesAndRewards,
    ];

    return (
      !!(portalTypes.indexOf(item.itemMeta.type) > -1) &&
      item.dataSources?.find(
        (dataSource) => dataSource.registeredDataSource === 'TTV'
      )
    );
  }
}
