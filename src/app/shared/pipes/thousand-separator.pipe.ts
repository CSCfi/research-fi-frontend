//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'thousandSeparator',
    standalone: true,
})
export class ThousandSeparatorPipe implements PipeTransform {
  transform(value: any): any {
    const transformed = value
      ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
      : '0';
    return transformed;
  }
}
