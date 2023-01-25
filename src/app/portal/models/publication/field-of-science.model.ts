// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { Injectable } from '@angular/core';
import { Adapter } from '../adapter.model';
import { ModelUtilsService } from '@shared/services/model-util.service';

export class FieldOfScience {
  constructor(public id: number, public name) {}
}

@Injectable({
  providedIn: 'root',
})
export class FieldOfScienceAdapter implements Adapter<FieldOfScience> {
  constructor(private utils: ModelUtilsService) {}
  adapt(item: any): FieldOfScience {
    return new FieldOfScience(
      item.fieldIdScience,
      this.utils.translateFieldOfScience(item)
    );
  }
}
