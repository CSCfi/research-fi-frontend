//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Pipe, PipeTransform } from '@angular/core';
import { Counter } from '../components/results/filters/counter';

const counters = new WeakMap<any, Counter>();

@Pipe({
  name: 'counterPipe'
})
export class CounterPipe implements PipeTransform  {
  transform(value: any): Counter {
    if (!counters.has(value)) {
      counters.set(value, new Counter());
    }
    return counters.get(value);
  }
}
