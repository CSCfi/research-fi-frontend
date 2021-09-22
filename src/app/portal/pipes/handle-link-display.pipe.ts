// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'handleLinkDisplay',
})
export class HandleLinkDisplayPipe implements PipeTransform {
  transform(url: string): string {
    const prefixList = ['dx.doi org', 'dx.doi.org', 'urn.fi'];

    if (prefixList.find((prefix) => url.includes(prefix))) {
      const prefixMatch = prefixList.find((prefix) => url.includes(prefix));
      url = url.split(prefixMatch + '/')[1];
    }

    return url.replace(/(^\w+:|^)\/\//, '');
  }
}
