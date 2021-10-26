// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Injectable } from '@angular/core';
import { Adapter } from './adapter.model';
import { mapGroup, mapGroupFieldName } from './utils';

export class DescriptionFields {
  constructor(public researcherDescriptionGroups: any, public keywords: any) {}
}

@Injectable({
  providedIn: 'root',
})
export class DescriptionFieldsAdapter implements Adapter<DescriptionFields> {
  mapGroup = mapGroup;
  mapGroupFieldName = mapGroupFieldName;
  constructor() {}

  adapt(item: any): DescriptionFields {
    return new DescriptionFields(
      this.mapGroupFieldName(
        item.researcherDescriptionGroups,
        'researchDescription',
        'Kuvaus',
        'researchDescription',
        {
          localized: true,
        }
      ),
      this.mapGroup(item.keywordGroups, 'keywords', 'Avainsanat', {
        joined: true,
      })
    );
  }
}
