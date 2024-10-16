//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Pipe, PipeTransform } from '@angular/core';
import { CheckFieldLocalePipe } from './check-field-locale.pipe';

@Pipe({
    name: 'getPrimaryOptions',
    standalone: true,
})
export class GetPrimaryOptionsPipe implements PipeTransform {
  transform(
    items: unknown,
    index: number,
    locale: string,
    fieldName: string
  ): unknown {
    const checkFieldLocale = new CheckFieldLocalePipe();
    const mappedItems = [];
    const options = [];

    items[index].items.forEach((item) => mappedItems.push(item));

    mappedItems.map((item) =>
      options.push({
        id: item.itemMeta.id,
        value: checkFieldLocale.transform(item, locale, fieldName),
      })
    );

    return options;
  }
}
