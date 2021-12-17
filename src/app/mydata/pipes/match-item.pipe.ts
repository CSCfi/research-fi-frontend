// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'matchItem',
})
/*
 * Find match between patch items and item in profile data
 */
export class MatchItemPipe implements PipeTransform {
  transform(patchItems: any[], itemMeta: { id: string; type: number }) {
    return !!patchItems.find(
      (item) => item.id === itemMeta.id && item.type === itemMeta.type
    );
  }
}
