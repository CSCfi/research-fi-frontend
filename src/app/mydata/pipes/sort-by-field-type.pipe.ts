//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Pipe, PipeTransform } from '@angular/core';
import { GroupTypes } from '@mydata/constants/groupTypes';
import { get } from 'lodash-es';

@Pipe({
  name: 'sortByFieldType',
})
export class SortByFieldTypePipe implements PipeTransform {
  transform(items: any[], fieldType: string): any[] {
    const groupTypes = GroupTypes;

    const sortBy = (path) => items.sort((a, b) => get(b, path) - get(a, path));

    switch (fieldType) {
      case groupTypes.affiliation: {
        return sortBy('itemMeta.primaryValue');
      }
      default:
        return items;
    }
  }
}
