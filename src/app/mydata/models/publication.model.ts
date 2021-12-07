// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Injectable } from '@angular/core';
import { Adapter } from './adapter.model';
import { mapGroup } from './utils';
import { PublicationItemAdapter } from './item/publication-item.model';

export class PublicationFields {
  constructor(public publication: any) {}
}

@Injectable({
  providedIn: 'root',
})
export class PublicationFieldsAdapter implements Adapter<PublicationFields> {
  mapGroup = mapGroup;
  constructor(private publicationItemAdapter: PublicationItemAdapter) {}

  adapt(item: any): PublicationFields {
    item.publicationGroups.forEach(
      (group) =>
        (group.items = group.items.map(
          (item) => (item = this.publicationItemAdapter.adapt(item))
        ))
    );

    return new PublicationFields(
      this.mapGroup(
        item.publicationGroups,
        'publications',
        $localize`:@@publications:Julkaisut`
      )
    );
  }
}
