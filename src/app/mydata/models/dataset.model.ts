// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Injectable } from '@angular/core';
import { Adapter } from './adapter.model';
import { mapGroup } from './utils';

export class DatasetFields {
  constructor(public dataset: any) {}
}

@Injectable({
  providedIn: 'root',
})
export class DatasetFieldsAdapter implements Adapter<DatasetFields> {
  mapGroup = mapGroup;
  constructor() {}

  adapt(item: any): DatasetFields {
    item.datasetGroups = []; // Remove when data in API response

    return new DatasetFields(
      this.mapGroup(
        item.datasetGroups,
        'datasets',
        $localize`:@@datasets:Tutkimusaineistot`
      )
    );
  }
}
