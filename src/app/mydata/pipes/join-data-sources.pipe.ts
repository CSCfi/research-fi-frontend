//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'joinDataSources',
    standalone: true,
})
export class JoinDataSourcesPipe implements PipeTransform {
  transform(items: any, locale: string) {
    let combined = [];
    items.forEach((item) => {
      item.dataSources.forEach((ds) => {
        if (!combined.includes(ds.organization['name' + locale])) {
          combined.push(ds.organization['name' + locale]);
        }
      });
    });
    return combined.join(', ');
  }
}
