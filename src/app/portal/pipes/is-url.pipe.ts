// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'isUrl',
    standalone: true,
})
export class IsUrlPipe implements PipeTransform {
  transform(url: string): boolean {
    // Some 'doiHandle' fields have empty string instad of dot in url
    if (url?.trim().includes(' ')) return false;

    try {
      new URL(url);
    } catch (e) {
      return false;
    }
    return true;
  }
}
