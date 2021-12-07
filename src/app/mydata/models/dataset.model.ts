// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Injectable } from '@angular/core';
import { Adapter } from './adapter.model';
import { DatasetItemAdapter } from './item/dataset-item.model';
import { mapGroup } from './utils';

export class DatasetFields {
  constructor(public dataset: any) {}
}

@Injectable({
  providedIn: 'root',
})
export class DatasetFieldsAdapter implements Adapter<DatasetFields> {
  mapGroup = mapGroup;
  constructor(private datasetItemAdapter: DatasetItemAdapter) {}

  adapt(item: any): DatasetFields {
    item.researchDatasetGroups.forEach(
      (group) =>
        (group.items = group.items.map(
          (item) => (item = this.datasetItemAdapter.adapt(item))
        ))
    );

    return new DatasetFields(
      this.mapGroup(
        item.researchDatasetGroups,
        'datasets',
        $localize`:@@datasets:Tutkimusaineistot`
      )
    );
  }
}
