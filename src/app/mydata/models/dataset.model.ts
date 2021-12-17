// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Injectable } from '@angular/core';
import { MydataUtilityService } from '@mydata/services/mydata-utility.service';
import { Adapter } from './adapter.model';
import { DatasetAdapter } from '@portal/models/dataset/dataset.model';

export class DatasetFields {
  constructor(public dataset: any) {}
}

@Injectable({
  providedIn: 'root',
})
export class DatasetFieldsAdapter implements Adapter<DatasetFields> {
  constructor(
    private datasetAdapter: DatasetAdapter,
    private mydataUtils: MydataUtilityService
  ) {}

  adapt(item: any): DatasetFields {
    /*
     * Leverage model from Portal.
     */
    item.researchDatasetGroups.forEach(
      (group) =>
        (group.items = group.items.map(
          (item) =>
            (item = {
              ...this.datasetAdapter.adapt(item),
              itemMeta: item.itemMeta,
            })
        ))
    );

    return new DatasetFields(
      this.mydataUtils.mapGroup(
        item.researchDatasetGroups,
        'datasets',
        $localize`:@@datasets:Tutkimusaineistot`
      )
    );
  }
}
