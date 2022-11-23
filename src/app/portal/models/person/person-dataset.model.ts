// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Adapter } from '../adapter.model';
import { Injectable } from '@angular/core';
import { ModelUtilsService } from '@shared/services/model-util.service';

export class PersonDataset {
  constructor(
    public id: string,
    public name: string,
    public year: number,
    public description: string,
    public sources: string
  ) {}
}

@Injectable({
  providedIn: 'root',
})
export class PersonDatasetAdapter implements Adapter<PersonDataset> {
  constructor(private utils: ModelUtilsService) {}

  adapt(dataset: any): PersonDataset {
    return new PersonDataset(
      dataset.identifier,
      this.utils.checkTranslation('name', dataset),
      dataset.datasetCreated,
      this.utils.checkTranslation('description', dataset),
      this.utils.mapSources(dataset.dataSources)
    );
  }
}
