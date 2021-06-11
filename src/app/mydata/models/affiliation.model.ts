// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Injectable } from '@angular/core';
import { Adapter } from './adapter.model';
import { mapGroup, mapGroupFieldName } from './utils';

export class AffiliationFields {
  constructor(public affiliation: any) {}
}

@Injectable({
  providedIn: 'root',
})
export class AffiliationFieldsAdapter implements Adapter<AffiliationFields> {
  mapGroup = mapGroup;
  mapGroupFieldName = mapGroupFieldName;
  constructor() {}

  adapt(item: any): AffiliationFields {
    return new AffiliationFields(
      this.mapGroup(item.affiliationGroups, 'Affiliaatiot', {
        primaryValue: true,
      })
    );
  }
}
