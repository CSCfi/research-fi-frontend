// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Injectable } from '@angular/core';
import { Adapter } from './adapter.model';
import { mapGroup } from './utils';

export class EducationFields {
  constructor(public education: any) {}
}

@Injectable({
  providedIn: 'root',
})
export class EducationFieldsAdapter implements Adapter<EducationFields> {
  mapGroup = mapGroup;
  constructor() {}

  adapt(item: any): EducationFields {
    return new EducationFields(this.mapGroup(item.educationGroups, 'Koulutus'));
  }
}
