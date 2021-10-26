// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'joinAllGroupItems',
})
export class JoinAllGroupItemsPipe implements PipeTransform {
  transform(group: any) {
    const getNames = () =>
      group
        .flatMap((groupItem) =>
          groupItem.items
            .filter((item) => item.itemMeta.show)
            .flatMap((item) => item.fullName)
        )
        .join(', ');

    return getNames();
  }
}
