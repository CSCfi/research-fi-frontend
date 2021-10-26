// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Injectable } from '@angular/core';
import { Adapter } from './adapter.model';
import { mapGroup } from './utils';

export class PublicationFields {
  constructor(public keywords: any) {}
}

@Injectable({
  providedIn: 'root',
})
export class PublicationFieldsAdapter implements Adapter<PublicationFields> {
  mapGroup = mapGroup;
  constructor() {}

  adapt(item: any): PublicationFields {
    return new PublicationFields(
      this.mapGroup(item.publicationGroups, 'publications', 'Julkaisut')
    );
  }
}
