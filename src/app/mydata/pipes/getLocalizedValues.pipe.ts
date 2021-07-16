//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'getLocalizedValues',
})
export class GetLocalizedValuesPipe implements PipeTransform {
  transform(value: any) {
    const res = [];

    const localizedValues = Object.keys(value).filter(
      (item) => item !== 'itemMeta'
    );

    localizedValues.forEach((item) => {
      if (value[item])
        res.push({ value: value[item], locale: item.slice(item.length - 2) });
    });

    return res;
  }
}
