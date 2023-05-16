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
    private mydataUtils: MydataUtilityService,
    private datasetAdapter: DatasetAdapter
  ) {}

  adapt(item: any): DatasetFields {
    item.researchDatasets = item.researchDatasets.map((dataset) => ({
      ...this.datasetAdapter.adapt(dataset),
      itemMeta: dataset.itemMeta,
      dataSources: dataset.dataSources,
    }));

    return new DatasetFields(
      this.mydataUtils.mapGroupGeneral(
        item,
        'dataset',
        'researchDatasets',
        $localize`:@@datasets:Tutkimusaineistot`
      )
    );
  }
}
